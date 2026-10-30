import {
  signInWithPopup,
  GithubAuthProvider,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from './firebaseSync';

export type GitHubSyncStatus = 'synced' | 'syncing' | 'unsynced';

export interface GitHubUserSession {
  username: string;
  displayName: string;
  avatarUrl: string;
  token?: string;
  selectedRepo?: string;
  selectedBranch?: string;
  lastSyncTime?: string;
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  description: string | null;
  htmlUrl: string;
}

export interface GitHubTreeNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url?: string;
}

const GITHUB_SESSION_STORAGE_KEY = 'kbt_github_user_session_v1';
const GITHUB_SYNC_STATUS_KEY = 'kbt_github_sync_status_v1';

export class GitHubSyncService {
  private currentSession: GitHubUserSession | null = null;
  private syncStatus: GitHubSyncStatus = 'unsynced';

  constructor() {
    this.loadPersistedSession();
  }

  private loadPersistedSession() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(GITHUB_SESSION_STORAGE_KEY);
      if (stored) {
        this.currentSession = JSON.parse(stored);
      }
      const statusStored = localStorage.getItem(GITHUB_SYNC_STATUS_KEY);
      if (statusStored === 'synced' || statusStored === 'syncing' || statusStored === 'unsynced') {
        this.syncStatus = statusStored;
      }
    } catch (e) {
      console.warn('Failed to load GitHub session from storage:', e);
    }
  }

  private persistSession() {
    if (typeof window === 'undefined') return;
    if (this.currentSession) {
      localStorage.setItem(GITHUB_SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
    } else {
      localStorage.removeItem(GITHUB_SESSION_STORAGE_KEY);
    }
    localStorage.setItem(GITHUB_SYNC_STATUS_KEY, this.syncStatus);
    window.dispatchEvent(
      new CustomEvent('kbt-github-sync', {
        detail: {
          session: this.currentSession,
          status: this.syncStatus,
        },
      })
    );
  }

  public getSession(): GitHubUserSession | null {
    return this.currentSession;
  }

  public getStatus(): GitHubSyncStatus {
    return this.syncStatus;
  }

  public setStatus(status: GitHubSyncStatus) {
    this.syncStatus = status;
    this.persistSession();
  }

  public setSelectedRepo(repoFullName: string, branch: string = 'main') {
    if (!this.currentSession) return;
    this.currentSession.selectedRepo = repoFullName;
    this.currentSession.selectedBranch = branch;
    this.setStatus('unsynced');
  }

  /**
   * Authenticate with GitHub via Firebase Popup requesting 'repo' scope
   */
  public async loginWithGitHub(): Promise<GitHubUserSession> {
    const provider = new GithubAuthProvider();
    provider.addScope('repo'); // Grants access to read and commit to public & private repos
    provider.addScope('read:user');

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;

      const session: GitHubUserSession = {
        username: (user as any)?.reloadUserInfo?.screenName || user.displayName || 'github-user',
        displayName: user.displayName || 'GitHub User',
        avatarUrl: user.photoURL || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        token: token,
      };

      this.currentSession = session;
      this.setStatus('unsynced');
      return session;
    } catch (err: any) {
      console.error('GitHub authentication failed:', err);
      throw err;
    }
  }

  /**
   * Connect using Personal Access Token fallback (with 'repo' scope)
   */
  public async loginWithToken(token: string): Promise<GitHubUserSession> {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      throw new Error(`Invalid GitHub Personal Access Token (${res.status} ${res.statusText})`);
    }

    const userData = await res.json();
    const session: GitHubUserSession = {
      username: userData.login,
      displayName: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      token,
    };

    this.currentSession = session;
    this.setStatus('unsynced');
    return session;
  }

  public async logout(): Promise<void> {
    await signOut(auth).catch(() => {});
    this.currentSession = null;
    this.setStatus('unsynced');
  }

  /**
   * Fetch repositories accessible by the authenticated user
   */
  public async fetchRepositories(): Promise<GitHubRepoItem[]> {
    if (!this.currentSession?.token) {
      throw new Error('Not authenticated with GitHub');
    }

    const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${this.currentSession.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch repositories (${res.status})`);
    }

    const repos = await res.json();
    return repos.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      private: r.private,
      defaultBranch: r.default_branch || 'main',
      description: r.description,
      htmlUrl: r.html_url,
    }));
  }

  /**
   * Fetch repository tree structure (files & folders) for selected files synchronization
   */
  public async fetchRepoTree(repoFullName: string, branch: string = 'main'): Promise<GitHubTreeNode[]> {
    if (!this.currentSession?.token) {
      throw new Error('Not authenticated with GitHub');
    }

    const res = await fetch(
      `https://api.github.com/repos/${repoFullName}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${this.currentSession.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch repo tree for ${repoFullName} (${res.status})`);
    }

    const data = await res.json();
    return (data.tree || []) as GitHubTreeNode[];
  }

  /**
   * Commit and push project metadata JSON to GitHub repository
   */
  public async pushProjectMetadata(
    repoFullName: string,
    filePath: string,
    projectData: any,
    commitMessage: string = 'chore(kbt): sync project metadata & tutorial blueprints'
  ): Promise<{ commitSha: string; fileUrl: string }> {
    if (!this.currentSession?.token) {
      throw new Error('Please authenticate with GitHub before syncing');
    }

    this.setStatus('syncing');

    try {
      const token = this.currentSession.token;
      const cleanPath = filePath.replace(/^\/+/, '');
      const getFileUrl = `https://api.github.com/repos/${repoFullName}/contents/${cleanPath}`;

      // 1. Check if file already exists to get current sha (required for GitHub update)
      let existingSha: string | undefined = undefined;
      const getRes = await fetch(getFileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (getRes.ok) {
        const fileInfo = await getRes.json();
        existingSha = fileInfo.sha;
      }

      // 2. Base64 encode file content
      const jsonString = JSON.stringify(projectData, null, 2);
      // UTF-8 safe base64 encoding
      const utf8Bytes = new TextEncoder().encode(jsonString);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64Content = btoa(binary);

      // 3. Put / commit file to repository
      const putRes = await fetch(getFileUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
          sha: existingSha,
          branch: this.currentSession.selectedBranch || 'main',
        }),
      });

      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to commit metadata (${putRes.status})`);
      }

      const putData = await putRes.json();
      const commitSha = putData.commit?.sha || putData.content?.sha || 'committed';
      const fileUrl = putData.content?.html_url || `https://github.com/${repoFullName}/blob/main/${cleanPath}`;

      this.currentSession.lastSyncTime = new Date().toISOString();
      this.setStatus('synced');

      return { commitSha, fileUrl };
    } catch (err) {
      this.setStatus('unsynced');
      throw err;
    }
  }
}

export const githubSyncService = new GitHubSyncService();

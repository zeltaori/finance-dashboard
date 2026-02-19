// Google Drive Service para backup automático
// Nota: Você precisa criar uma OAuth2 App no Google Cloud Console
// e adicionar o CLIENT_ID abaixo

const CLIENT_ID = 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_NAME = 'FinanceDashboard_Backups';

interface BackupFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
}

interface BackupData {
  timestamp: string;
  data: unknown;
}

let tokenClient: any = null;
let accessToken = '';

const getGapi = () => (window as any).gapi;
const getGoogle = () => (window as any).google;

export const googleDriveService = {
  // Inicializar Google API
  async initialize() {
    return new Promise((resolve, reject) => {
      getGapi().load('client', async () => {
        try {
          await getGapi().client.init({
            apiKey: 'SEU_API_KEY_AQUI',
            clientId: CLIENT_ID,
            scope: SCOPES,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
          });

          // Inicializar TokenClient para OAuth
          tokenClient = getGoogle().accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (response: any) => {
              if (response.access_token) {
                accessToken = response.access_token;
                resolve(true);
              } else {
                reject(new Error('Falha ao obter token de acesso'));
              }
            }
          });

          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    });
  },

  // Fazer login com Google
  async login() {
    return new Promise((resolve, reject) => {
      try {
        tokenClient.requestAccessToken({ prompt: 'consent' });
        // Aguardar callback
        setTimeout(() => {
          if (accessToken) {
            resolve(true);
          } else {
            reject(new Error('Falha no login'));
          }
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Fazer logout
  logout() {
    getGoogle().accounts.id.disableAutoSelect();
    accessToken = '';
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!accessToken;
  },

  // Obter ou criar pasta de backups
  async getFolderId() {
    try {
      const response = await getGapi().client.drive.files.list({
        q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
        pageSize: 1
      });

      if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id;
      }

      // Criar pasta se não existir
      const createResponse = await getGapi().client.drive.files.create({
        resource: {
          name: FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });

      return createResponse.result.id;
    } catch (error) {
      console.error('Erro ao obter pasta:', error);
      throw error;
    }
  },

  // Fazer backup dos dados
  async backup(data: unknown) {
    if (!accessToken) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    try {
      const folderId = await this.getFolderId();
      const timestamp = new Date().toISOString();
      const fileName = `backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}_${new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-')}.json`;

      const backupData: BackupData = {
        timestamp,
        data
      };

      const file = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });

      const metadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: [folderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: form
      });

      if (!response.ok) {
        throw new Error(`Erro ao fazer backup: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      throw error;
    }
  },

  // Listar backups disponíveis
  async listBackups(): Promise<BackupFile[]> {
    if (!accessToken) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    try {
      const folderId = await this.getFolderId();

      const response = await getGapi().client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
        spaces: 'drive',
        fields: 'files(id, name, createdTime, modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 50
      });

      return response.result.files || [];
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      throw error;
    }
  },

  // Restaurar backup
  async restoreBackup(fileId: string): Promise<unknown> {
    if (!accessToken) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao restaurar backup: ${response.statusText}`);
      }

      const backupData: BackupData = await response.json();
      return backupData.data;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw error;
    }
  },

  // Deletar backup
  async deleteBackup(fileId: string) {
    if (!accessToken) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    try {
      await getGapi().client.drive.files.delete({
        fileId: fileId
      });
    } catch (error) {
      console.error('Erro ao deletar backup:', error);
      throw error;
    }
  }
};

// Declarar tipos globais
if (typeof window !== 'undefined') {
  (window as any).gapi = (window as any).gapi || {};
  (window as any).google = (window as any).google || {};
}

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  updateDoc,
  query, 
  where, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  doc,
  Timestamp
} from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDfKDci2FDWYlk2RRX7yUx7TTVjNIYpGnw',
  authDomain: 'gestaofinanceira-6de85.firebaseapp.com',
  projectId: 'gestaofinanceira-6de85',
  storageBucket: 'gestaofinanceira-6de85.firebasestorage.app',
  messagingSenderId: '217543486650',
  appId: '1:217543486650:web:i12c3d75bb575f5666b6683'
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export interface BackupFile {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  data: unknown;
}

export const firebaseService = {
  // Fazer login com Google
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  // Fazer logout
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },

  // Obter usuário atual
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Observar mudanças de autenticação
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Fazer backup dos dados
  async backup(data: unknown, name?: string) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    try {
      const backupName = name || `Backup ${new Date().toLocaleString('pt-BR')}`;
      
      // Usar um ID fixo para manter apenas um backup atualizado
      const backupId = 'latest-backup';
      
      const backupData = {
        name: backupName,
        data: data,
        updatedAt: Timestamp.now(),
        userId: user.uid
      };
      
      console.log('Backup data being saved:', backupData);
      
      try {
        // Tentar atualizar o documento existente
        console.log('Tentando atualizar documento:', backupId);
        await updateDoc(doc(db, 'users', user.uid, 'backups', backupId), backupData);
        console.log('Documento atualizado com sucesso!');
      } catch (updateError: any) {
        console.log('Erro ao atualizar:', updateError.code, updateError.message);
        // Se o documento não existir, criar um novo
        if (updateError.code === 'not-found') {
          console.log('Documento não encontrado, criando novo...');
          await setDoc(doc(db, 'users', user.uid, 'backups', backupId), {
            ...backupData,
            createdAt: Timestamp.now()
          });
          console.log('Novo documento criado!');
        } else {
          throw updateError;
        }
      }

      console.log('Backup saved successfully to:', `users/${user.uid}/backups/${backupId}`);
      return backupId;
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      throw error;
    }
  },

  // Listar backups disponíveis
  async listBackups(): Promise<BackupFile[]> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    try {
      const q = query(
        collection(db, 'users', user.uid, 'backups'),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const backups: BackupFile[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        backups.push({
          id: doc.id,
          name: data.name,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          data: data.data
        });
      });

      return backups;
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      throw error;
    }
  },

  // Restaurar backup
  async restoreBackup(backupId: string): Promise<unknown> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    try {
      const backups = await this.listBackups();
      const backup = backups.find(b => b.id === backupId);

      if (!backup) {
        throw new Error('Backup não encontrado');
      }

      return backup.data;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw error;
    }
  },

  // Deletar backup
  async deleteBackup(backupId: string) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'backups', backupId));
    } catch (error) {
      console.error('Erro ao deletar backup:', error);
      throw error;
    }
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!auth.currentUser;
  }
};

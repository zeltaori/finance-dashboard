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
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'backups'), {
        name: backupName,
        data: data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        userId: user.uid
      });

      return docRef.id;
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

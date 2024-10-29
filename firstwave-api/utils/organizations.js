import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  getDoc,
  getDocs,
  query,
  where 
} from 'firebase/firestore';

// Create a new organization
export const createOrganization = async (orgData) => {
  try {
    const orgRef = await addDoc(collection(db, 'organizations'), {
      ...orgData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return orgRef.id;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
};

// Get organization by ID
export const getOrganizationById = async (orgId) => {
  try {
    const orgDoc = await getDoc(doc(db, 'organizations', orgId));
    if (!orgDoc.exists()) return null;
    return { id: orgDoc.id, ...orgDoc.data() };
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw error;
  }
};

// Get all organizations
export const getAllOrganizations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'organizations'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
};

// Update organization
export const updateOrganization = async (orgId, updates) => {
  try {
    const orgRef = doc(db, 'organizations', orgId);
    await updateDoc(orgRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

// Delete organization
export const deleteOrganization = async (orgId) => {
  try {
    await deleteDoc(doc(db, 'organizations', orgId));
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
};

// Search organizations by name
export const searchOrganizationsByName = async (searchTerm) => {
  try {
    const q = query(
      collection(db, 'organizations'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching organizations:', error);
    throw error;
  }
}; 
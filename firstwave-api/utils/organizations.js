const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

// Create a new organization
const createOrganization = async (orgData) => {
  try {
    const orgRef = await db.collection('organizations').doc(orgData.id).set({
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
const getOrganizationById = async (orgId) => {
  try {
    const orgRef = db.collection('organizations').doc(orgId);
    const doc = await orgRef.get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw error;
  }
};

// Get all organizations
const getAllOrganizations = async () => {
  try {
    const querySnapshot = await db.collection('organizations').get();
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
const updateOrganization = async (orgId, updates) => {
  try {
    const orgRef = db.collection('organizations').doc(orgId);
    await orgRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

// Delete organization
const deleteOrganization = async (orgId) => {
  try {
    await db.collection('organizations').doc(orgId).delete();
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
};

// Search organizations by name
const searchOrganizationsByName = async (searchTerm) => {
  try {
    const q = db.collection('organizations').where('name', '>=', searchTerm).where('name', '<=', searchTerm + '\uf8ff');
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching organizations:', error);
    throw error;
  }
};

// Get tests under an organization
const getTestsByOrgId = async (orgId) => {
  const tests = await db.collection('organizations').doc(orgId).collection('tests').get();
  return tests.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Export the functions
module.exports = {
  createOrganization,
  getOrganizationById,
  getAllOrganizations,
  updateOrganization,
  deleteOrganization,
  searchOrganizationsByName,
  getTestsByOrgId
}; 
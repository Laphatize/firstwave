const db = require('../config/firebase');
const Attack = require('../utils/attack');

class QueueProcessor {
  constructor() {
    this.isProcessing = false;
    this.processingInterval = 30000; // 30 seconds
    this.maxConcurrentAttacks = 2;
    this.currentAttacks = new Map();
  }

  async start() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    setInterval(() => this.processQueue(), this.processingInterval);
    console.log('Queue processor started');
  }

  async processQueue() {
    try {
      // Check if we can process more attacks
      if (this.currentAttacks.size >= this.maxConcurrentAttacks) {
        return;
      }

      // Get pending tests using a regular collection query instead of collectionGroup
      const snapshot = await db.collection('organizations').get();
      const pendingTests = [];
      
      // Manually gather pending tests from all organizations
      for (const orgDoc of snapshot.docs) {
        const testsSnapshot = await orgDoc.ref.collection('tests')
          .where('state', '==', 'Starting Soon')
          .limit(this.maxConcurrentAttacks - this.currentAttacks.size)
          .get();
        
        testsSnapshot.docs.forEach(testDoc => {
          pendingTests.push({
            id: testDoc.id,
            orgId: orgDoc.id,
            ...testDoc.data()
          });
        });
      }

      // Process pending tests
      for (const test of pendingTests) {
        // Skip if already processing
        if (this.currentAttacks.has(test.id)) continue;

        // Create and execute attack
        const attack = new Attack(
          test.id,
          test.orgId,
          test.type,
          test.scope,
          test.permissions,
          test.context
        );

        // Add to tracking
        this.currentAttacks.set(test.id, attack);

        // Execute attack
        attack.executeAttack()
          .then(() => {
            this.currentAttacks.delete(test.id);
          })
          .catch(error => {
            console.error(`Attack failed for test ${test.id}:`, error);
            this.currentAttacks.delete(test.id);
          });
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    }
  }

  async stop() {
    this.isProcessing = false;
    // Cleanup current attacks
    for (const attack of this.currentAttacks.values()) {
      await attack.updateTestState('Stopped');
    }
    this.currentAttacks.clear();
    console.log('Queue processor stopped');
  }
}

// Create singleton instance
const queueProcessor = new QueueProcessor();

module.exports = queueProcessor; 
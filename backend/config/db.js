import { createRequire } from 'module';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firestoreDb;

export async function connectToDatabase() {
  if (firestoreDb) {
    return firestoreDb;
  }

  try {
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    initializeApp({
      credential: cert(serviceAccount)
    });

    firestoreDb = getFirestore();
    console.log('Firebase Admin SDK initialized successfully with Firestore.');
    return firestoreDb;
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK:', err);
    throw err;
  }
}

// Mock MongoDB DB interface wrapper mapping calls to Firestore
class MockMongoCollection {
  constructor(name) {
    this.name = name;
    this.ref = firestoreDb.collection(name);
  }

  find(query = {}) {
    const ref = this.ref;
    let limitVal = null;
    let sortObj = null;

    const cursor = {
      sort: (s) => {
        sortObj = s;
        return cursor;
      },
      limit: (l) => {
        limitVal = l;
        return cursor;
      },
      toArray: async () => {
        let q = ref;
        // Map simple query filters
        Object.keys(query).forEach((key) => {
          let val = query[key];
          if (key !== '_id') {
            q = q.where(key, '==', val);
          }
        });

        const snapshot = await q.get();
        let docs = [];
        snapshot.forEach((doc) => {
          docs.push({ _id: doc.id, ...doc.data() });
        });

        // In-memory filter for _id
        if (query._id) {
          const idVal = query._id.toString();
          docs = docs.filter((d) => String(d._id) === idVal);
        }

        // Apply in-memory sorting
        if (sortObj) {
          const sortKeys = Object.keys(sortObj);
          if (sortKeys.length > 0) {
            const sortKey = sortKeys[0];
            const direction = sortObj[sortKey]; // 1 or -1
            
            docs.sort((a, b) => {
              const valA = a[sortKey];
              const valB = b[sortKey];
              
              if (valA === undefined) return 1;
              if (valB === undefined) return -1;
              
              const dateA = new Date(valA);
              const dateB = new Date(valB);
              
              if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return direction === 1 ? dateA - dateB : dateB - dateA;
              }
              
              if (valA < valB) return direction === 1 ? -1 : 1;
              if (valA > valB) return direction === 1 ? 1 : -1;
              return 0;
            });
          }
        }

        // Apply in-memory limit
        if (limitVal !== null && limitVal !== undefined) {
          docs = docs.slice(0, limitVal);
        }

        return docs;
      }
    };
    return cursor;
  }

  async findOne(query = {}) {
    if (query._id) {
      const idVal = query._id.toString();
      const doc = await this.ref.doc(idVal).get();
      if (!doc.exists) return null;
      return { _id: doc.id, ...doc.data() };
    }

    let q = this.ref;
    Object.keys(query).forEach((key) => {
      q = q.where(key, '==', query[key]);
    });

    const snapshot = await q.limit(1).get();
    if (snapshot.empty) return null;
    let found;
    snapshot.forEach((doc) => {
      found = { _id: doc.id, ...doc.data() };
    });
    return found;
  }

  async insertOne(doc) {
    const cleanDoc = { ...doc };
    delete cleanDoc._id; // Remove _id if it's undefined/placeholder

    // Convert Date objects to ISO strings
    Object.keys(cleanDoc).forEach((k) => {
      if (cleanDoc[k] instanceof Date) {
        cleanDoc[k] = cleanDoc[k].toISOString();
      }
    });

    const docRef = await this.ref.add(cleanDoc);
    return {
      acknowledged: true,
      insertedId: docRef.id
    };
  }

  async updateOne(query, update, options = {}) {
    const setObj = update.$set || {};
    const incObj = update.$inc || {};

    const dataToSave = { ...setObj };
    Object.keys(dataToSave).forEach((k) => {
      if (dataToSave[k] instanceof Date) {
        dataToSave[k] = dataToSave[k].toISOString();
      }
    });

    // Handle field increments
    Object.keys(incObj).forEach((k) => {
      dataToSave[k] = FieldValue.increment(incObj[k]);
    });

    if (query._id) {
      const idVal = query._id.toString();
      const docRef = this.ref.doc(idVal);

      if (options.upsert) {
        await docRef.set(dataToSave, { merge: true });
      } else {
        await docRef.update(dataToSave);
      }
      return { modifiedCount: 1, upsertedCount: 0 };
    }

    let q = this.ref;
    Object.keys(query).forEach((key) => {
      q = q.where(key, '==', query[key]);
    });
    const snapshot = await q.limit(1).get();

    if (!snapshot.empty) {
      let docId;
      snapshot.forEach((doc) => { docId = doc.id; });
      await this.ref.doc(docId).set(dataToSave, { merge: true });
      return { modifiedCount: 1, upsertedCount: 0 };
    } else if (options.upsert) {
      const upsertDoc = { ...query, ...dataToSave };
      const docRef = await this.ref.add(upsertDoc);
      return { modifiedCount: 0, upsertedCount: 1, upsertedId: docRef.id };
    }

    return { modifiedCount: 0, upsertedCount: 0 };
  }

  async deleteOne(query) {
    if (query._id) {
      const idVal = query._id.toString();
      await this.ref.doc(idVal).delete();
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async deleteMany(query) {
    if (query._id && query._id.$in) {
      const ids = query._id.$in.map(id => id.toString());
      const batch = firestoreDb.batch();
      ids.forEach(id => {
        batch.delete(this.ref.doc(id));
      });
      await batch.commit();
      return { deletedCount: ids.length };
    }
    return { deletedCount: 0 };
  }

  async countDocuments(query = {}) {
    let q = this.ref;
    Object.keys(query).forEach((key) => {
      q = q.where(key, '==', query[key]);
    });
    const snapshot = await q.get();
    return snapshot.size;
  }

  aggregate(pipeline = []) {
    const ref = this.ref;
    return {
      toArray: async () => {
        const snapshot = await ref.get();
        let docs = [];
        snapshot.forEach((doc) => {
          docs.push({ _id: doc.id, ...doc.data() });
        });

        // 1. Process Match pipeline stage
        const matchStage = pipeline.find(stage => stage.$match);
        if (matchStage) {
          const matchFilter = matchStage.$match;
          if (matchFilter.createdAt && matchFilter.createdAt.$gte) {
            const gteDate = new Date(matchFilter.createdAt.$gte);
            const ltDate = new Date(matchFilter.createdAt.$lt);
            docs = docs.filter(d => {
              const dDate = new Date(d.createdAt);
              return dDate >= gteDate && dDate < ltDate;
            });
          }
        }

        // 2. Process Group pipeline stage
        const groupStage = pipeline.find(stage => stage.$group);
        if (groupStage) {
          const groupFields = groupStage.$group;
          
          if (groupFields._id === null) {
            const totalRevenue = docs.reduce((sum, d) => sum + Number(d.totalAmount || 0), 0);
            return [{ _id: null, totalRevenue }];
          }
          
          if (groupFields._id && typeof groupFields._id === 'object') {
            const groups = {};
            docs.forEach(d => {
              const date = new Date(d.createdAt);
              if (isNaN(date.getTime())) return;
              const year = date.getFullYear();
              const month = date.getMonth() + 1;
              const groupKey = `${year}-${month}`;
              
              if (!groups[groupKey]) {
                groups[groupKey] = {
                  _id: { year, month },
                  totalRevenue: 0,
                  billsCount: 0
                };
              }
              groups[groupKey].totalRevenue += Number(d.totalAmount || 0);
              groups[groupKey].billsCount += 1;
            });

            let groupedList = Object.values(groups);
            
            const sortStage = pipeline.find(stage => stage.$sort);
            if (sortStage) {
              const sortFields = sortStage.$sort;
              if (sortFields['_id.year'] || sortFields['_id.month']) {
                groupedList.sort((a, b) => {
                  if (a._id.year !== b._id.year) {
                    return a._id.year - b._id.year;
                  }
                  return a._id.month - b._id.month;
                });
              }
            }
            return groupedList;
          }
        }

        return docs;
      }
    };
  }
}

class MockMongoDb {
  collection(name) {
    return new MockMongoCollection(name);
  }
}

const mockDbInstance = new MockMongoDb();

export function getDb() {
  if (!firestoreDb) {
    throw new Error('Database is not connected yet.');
  }
  return mockDbInstance;
}

export async function closeDatabaseConnection() {
  // Connection pool closed automatically
}

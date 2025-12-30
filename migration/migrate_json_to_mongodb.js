import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

// MongoDB connection URI
const mongoURI = 'mongodb://localhost:27017';
const dbName = 'school_website_db';

// Path to the data directory
const dataDir = path.join(process.cwd(), 'data');

// Function to read JSON files from a directory recursively
function readJSONFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(readJSONFiles(fullPath));
        } else if (file.endsWith('.json')) {
            try {
                const fileContent = fs.readFileSync(fullPath, 'utf8');
                const jsonData = fileContent.trim() === '' ? [] : JSON.parse(fileContent);
                results.push({ path: fullPath, data: jsonData });
            } catch (error) {
                console.error(`Error parsing JSON file ${fullPath}:`, error.message);
            }
        }
    });

    return results;
}

// Function to migrate data to MongoDB
async function migrateData() {
    const client = new MongoClient(mongoURI);

    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);

        // Read all JSON files
        const jsonFiles = readJSONFiles(dataDir);

        // Iterate over each JSON file
        for (const { path: filePath, data } of jsonFiles) {
            // Extract collection name from file path
            const relativePath = path.relative(dataDir, filePath);
            const collectionName = path.basename(relativePath, '.json');

            // Remove _id conflicts
            if (Array.isArray(data)) {
                data.forEach(doc => {
                    if (doc._id) {
                        delete doc._id;
                    }
                });
            } else if (typeof data === 'object' && data._id) {
                delete data._id;
            }

            // Clear the collection before inserting
            await db.collection(collectionName).deleteMany({});

            // Insert data into MongoDB
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    await db.collection(collectionName).insertMany(data);
                    console.log(`Migrated ${data.length} records to collection: ${collectionName}`);
                }
            } else if (typeof data === 'object' && Object.keys(data).length > 0) {
                await db.collection(collectionName).insertOne(data);
                console.log(`Migrated 1 record to collection: ${collectionName}`);
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
}

// Execute migration
migrateData();
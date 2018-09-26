const AWS = require('aws-sdk');

let documentClient = new AWS.DynamoDB.DocumentClient({
    'region': 'eu-west-1'
});

module.exports = class DB {
    write(ID, data, table) {
        return new Promise((resolve, reject) => {
            if (!ID) throw 'An ID is needed';
            if (typeof ID !== 'string') throw `the id must be a string and not ${ID}`
            if (!data) throw "data is needed";
            if (!table) throw 'table name is needed';
            if (typeof table !== 'string') throw `the table name must be a string and not ${table}`

            let params = {
                TableName: table,
                Item: { ...data, ID: ID }
            };

            documentClient.put(params, function(err, result) {
                if (err) {
                    console.log("Err in writeForCall writing messages to dynamo:", err);
                    console.log(params);
                    return reject(err);
                }
                console.log('wrote data to table ', table)
                return resolve({ ...result.Attributes, ...params.Item });
            });
        })
    };

    get(key, value, table) {
        if (!table) throw 'table needed';
        if (typeof key !== 'string') throw `key was not string and was ${JSON.stringify(key)} on table ${table}`;
        if (typeof value !== 'string') throw `value was not string and was ${JSON.stringify(value)} on table ${table}`;
        if (!table) 'table needs to be users, sessions, or routes.'
        return new Promise((resolve, reject) => {
            let params = {
                TableName: table,
                Key: {
                    [key]: value
                }
            };
            documentClient.get(params, function(err, data) {
                if (err) {
                    console.log(`There was an error fetching the data for ${key} ${value} on table ${table}`, err);
                    return reject(err);
                }
                //TODO check only one Item.
                return resolve(data.Item);
            });
        });
    }

    getDifferent(key, value, table) {
        if (!table) throw 'table needed';
        if (typeof key !== 'string') throw `key was not string and was ${JSON.stringify(key)} on table ${table}`;
        if (typeof value !== 'string') throw `value was not string and was ${JSON.stringify(value)} on table ${table}`;
        if (!table) 'table needs to be users, sessions, or routes.'
        return new Promise((resolve, reject) => {
            var params = {
                TableName: table,
                IndexName: `${key}-index`,
                KeyConditionExpression: `${key} = :value`,
                ExpressionAttributeValues: {
                    ':value': value
                }
            };

            documentClient.query(params, function(err, data) {
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err));
                    reject(err);
                } else {
                    console.log("GetItem succeeded:", JSON.stringify(data.Items));
                    resolve(data.Items);
                }
            });
        })
    }

    async update(ID, table, key, value) {
        let data = await this.get(ID, table);
        return this.write(ID, { ...data, [key]: value }, table);
    }

    delete(ID, table) {
        if (!table) throw 'table needed';
        if (typeof ID !== 'string') throw `ID was not string and was ${JSON.stringify(ID)} on table ${table}`;
        console.log("dynamo deleting record ID", ID, 'from table ', table);
        let params = {
            TableName: table,
            Key: {
                ID
            }
        };

        return new Promise((resolve, reject) => {
            documentClient.delete(params, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

    }

}
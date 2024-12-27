const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { Api, Connection } = require("./database") // Import Api model

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Route to create a new API
app.post('/admin/apis', async (req, res) => {
    try {
        for (const body of req.body) {
            const { path, method, response, headers, functions, success, failure } = body;

            if (!path || !method || !response) {
                return res.status(400).json({ error: 'Path, method, and response are required.' });
            }

            await Api.findOneAndUpdate(
                { path },
                {
                    path,
                    method: method.toLowerCase(),
                    response,
                    headers: headers || {},
                    functions: functions || [],
                    success: success || null,
                    failure: failure || null,
                },
                { upsert: true }
            );
        }
        res.status(201).json({ message: 'APIs saved successfully.' });
    } catch (error) {
        console.error('Error saving APIs:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.post('/admin/connections', async (req, res) => {
    try {
        const { nodes, edges } = req.body;

        if (!Array.isArray(nodes) || !Array.isArray(edges)) {
            return res.status(400).json({ error: 'Invalid data format.' });
        }

        const connection = new Connection({ nodes, edges });
        await connection.save();

        res.status(201).json({ message: 'Connection saved successfully.' });
    } catch (error) {
        console.error('Error saving connection:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/admin/connections', async (req, res) => {
    try {
        const connections = await Connection.find();
        res.json(connections);
    } catch (error) {
        console.error('Error retrieving connections:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


// Admin panel route to get existing APIs
app.get('/admin/apis', async (req, res) => {
    try {
        const apis = await Api.find();
        res.json(apis);
    } catch (error) {
        console.error('Error retrieving APIs:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


// Helper function to handle nested API logic
const processNestedApi = async (api, req, res) => {
    let result = true;

    if (api.headers) {
        Object.entries(api.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
    }

    if (api.functions && api.functions.length > 0) {
        for (const fn of api.functions) {
            try {
                const functionResult = await eval(fn)(req, res);
                if (functionResult === false) {
                    result = false;
                    break;
                }
            } catch (error) {
                console.error('Error executing function:', error);
                result = false;
                break;
            }
        }
    }

    const nextNodePath = result ? api.success : api.failure;
    if (nextNodePath) {
        const nextApi = await Api.findOne({ path: nextNodePath });
        if (nextApi) {
            return processNestedApi(nextApi, req, res);
        }
    } else {
        return api.response;
    }
};


// Middleware to dynamically handle API requests
app.use(async (req, res, next) => {
    try {
        const api = await Api.findOne({ path: req.path, method: req.method.toLowerCase() });

        if (api) {
            const finalResponse = await processNestedApi(api, req, res);
            return res.json(finalResponse);
        }
    } catch (error) {
        console.error('Error processing API:', error);
    }
    next();
});



mongoose.connect('mongodb+srv://hemantkumar2335h:Hemant12@mydata.wprhwlz.mongodb.net/apiFlow', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

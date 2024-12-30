const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./middleware')
const { Api, Connection, User } = require("./database") // Import Api model

const app = express();
app.use(bodyParser.json());
app.use(cors());

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

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).send('User registered');
    } catch (error) {
        console.log(error)
        res.status(400).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).send('Invalid credentials');

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).send('Invalid credentials');

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.header('Authorization', token).send({ token , username });
    } catch (error) {
        console.log(error)
        res.status(400).send('Error logging in');
    }
});

app.get('/check',authenticateToken,async (req , res) => {
    res.status(200).send('success')
})

app.post('/admin/connections', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const { nodes, edges } = req.body;

        const check = await Connection.deleteMany({ user: userId });
        console.log(check)
        const newConnection = new Connection({ nodes, edges, user: userId });
        await newConnection.save();

        const user = await User.findById(userId);
        user.apiFlow.push(newConnection._id);
        await user.save();

        res.status(201).send('Connection saved');
    } catch (error) {
        console.log(error)
        res.status(400).send('Error saving connection');
    }
});


app.get('/admin/connections', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const connections = await Connection.find({ user: userId });
        res.json(connections);
    } catch (error) {
        res.status(400).send('Error fetching connections');
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



mongoose.connect(process.env.DABASE_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

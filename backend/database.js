const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
    path: { type: String, required: true },
    method: { type: String, required: true },
    response: { type: Object, required: true },
    headers: { type: Object, default: {} },
    functions: { type: [String], default: [] },
    success: { type: String, default: null },
    failure: { type: String, default: null },
});

const apiNodeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Unique identifier for the node            // Label for the node
    data: { type: Object, default: {} },               // Additional data associated with the node
    type: { type: String, required: true },            // Type of the node (e.g., "input", "output", "default")
    position: {                                         // Position of the node in the flowchart
        x: { type: Number, required: true },
        y: { type: Number, required: true },
    },             // Custom styles for the node
});

const edgeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Unique identifier for the edge
    source: { type: String, required: true },           // ID of the source node
    target: { type: String, required: true },           // ID of the target node
    type: { type: String, default: 'default' },         // Type of the edge (e.g., "default", "step", "smooth")
    animated: { type: Boolean, default: false },        // Whether the edge has animations
    label: { type: String, default: '' },               // Label displayed on the edge
    style: { type: Object, default: {} },               // Custom styles for the edge
    arrowHeadType: { type: String, default: 'arrow' },  // Type of the arrowhead (e.g., "arrow", "none")
});

const connectionSchema = new mongoose.Schema({
    nodes: { type: [apiNodeSchema], required: true }, // List of ApiNodes in the flow
    edges: { type: [edgeSchema], required: true },    // List of Edges in the flow
    createdAt: { type: Date, default: Date.now },     // Timestamp for the connection creation
    updatedAt: { type: Date, default: Date.now },     // Timestamp for the last update
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed passwords
    apiFlow: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connection' }], // Relates to the Connection schema
});

const Api = mongoose.model('Api', apiSchema);
const Connection = mongoose.model('Connection', connectionSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Api,Connection,User };

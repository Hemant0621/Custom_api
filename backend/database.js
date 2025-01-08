const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
    path: { type: String, required: true },
    method: { type: String, required: true },
    response: { type: Object, required: true },
    headers: { type: Object, default: {} },
    bodySchema : {type: Object, default : {}},
    functions: { type: [String], default: [] },
    success: { type: String, default: null },
    failure: { type: String, default: null },
});

const apiNodeSchema = new mongoose.Schema({
    id: { type: String, required: true}, 
    data: { type: Object, default: {} },               
    type: { type: String, required: true },            
    position: {                                         
        x: { type: Number, required: true },
        y: { type: Number, required: true },
    },             // Custom styles for the node
});

const edgeSchema = new mongoose.Schema({
    id: { type: String, required: true},
    source: { type: String, required: true },           
    target: { type: String, required: true },           
    type: { type: String, default: 'default' },         
    animated: { type: Boolean, default: false },        
    label: { type: String, default: '' },               
    style: { type: Object, default: {} },               
    arrowHeadType: { type: String, default: 'arrow' },  
});

const connectionSchema = new mongoose.Schema({
    nodes: { type: [apiNodeSchema], required: true }, 
    edges: { type: [edgeSchema], required: true },    
    createdAt: { type: Date, default: Date.now },     
    updatedAt: { type: Date, default: Date.now },    
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    apiFlow: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connection' }],
});

const Api = mongoose.model('Api', apiSchema);
const Connection = mongoose.model('Connection', connectionSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Api,Connection,User };

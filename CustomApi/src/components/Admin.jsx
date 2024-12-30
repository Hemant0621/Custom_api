import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Background,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { Backend_url } from "../../config";
import { customNodeTypes } from "./CustomNode";
import { customEdgeTypes } from "./CustomEdge";

function AdminPanel() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [nodeCount, setNodeCount] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [startnode, setstartnode] = useState(false);

    useEffect(() => {
        const loadFlowFromBackend = async () => {
            try {
                const token = localStorage.getItem('token');
                const check = await fetch(`${Backend_url}check`, {
                    headers: {
                        Authorization: token,
                    }
                });
                if (check.ok) {

                    const response = await fetch(`${Backend_url}admin/connections`, {
                        headers: {
                            Authorization: token,
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const { nodes: savedNodes, edges: savedEdges } = data[0] || { nodes: [], edges: [] };
                        setNodes(savedNodes);
                        setEdges(savedEdges);
                    } else {
                        console.error('Failed to load flow.');
                    }
                }
                else{
                    window.location.href = '/'
                }
            } catch (error) {
                console.error('Error loading flow:', error);
            }
        };

        loadFlowFromBackend();
    }, [])

    const updateNodeConnections = useCallback((edge) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === edge.source) {
                    const updatedData = { ...node.data };
                    const targetNode = nds.find((n) => n.id === edge.target);
                    if (targetNode) {
                        if (edge.sourceHandle === "success") {
                            updatedData.success = targetNode.data.url || null;
                        } else if (edge.sourceHandle === "failure") {
                            updatedData.failure = targetNode.data.url || null;
                        }
                    }
                    return { ...node, data: updatedData };
                }
                return node;
            })
        );
    }, []);

    const onConnect = useCallback(
        (params) => {
            const existingEdge = edges.find(
                (e) =>
                    e.source === params.source && e.sourceHandle === params.sourceHandle
            );
            if (existingEdge) {
                alert("This handle is already connected to another node.");
                return;
            }

            const newEdge = { ...params, animated: true, type: "CrossEdge" };
            setEdges((eds) => addEdge(newEdge, eds));
            updateNodeConnections(newEdge);
        },
        [edges, updateNodeConnections]
    );

    const onNodeClick = (event, node) => {
        setSelectedNode(node);
        setIsSidebarOpen(true);
    };

    const addStartNode = useCallback(() => {
        const startNode = {
            id: `start-${nodeCount}`,
            position: { x: 100, y: nodeCount * 100 + 50 },
            data: { label: "Start Point", url: "", success: null, failure: null },
            type: "startNode",
        };
        setNodes((nds) => nds.concat(startNode));
        setstartnode(true);
        setNodeCount((prevCount) => prevCount + 1);
    }, [nodeCount, setNodes]);

    const addApiNode = useCallback(() => {
        const apiNode = {
            id: `api-${nodeCount}`,
            position: { x: nodeCount * 100 + 200, y: 100 },
            data: {
                label: `API #${nodeCount}`,
                url: "",
                method: "GET",
                headers: "{}",
                body: "{}",
                response: "{}",
                success: null,
                failure: null,
            },
            type: "apiNode",
        };
        setNodes((nds) => nds.concat(apiNode));
        setNodeCount((prevCount) => prevCount + 1);
    }, [nodeCount, setNodes]);

    const handleSaveFlow = async () => {
        const apiNodes = nodes
            .filter(node => node.type === "apiNode")
            .map(node => ({
                path: node.data.url,
                method: node.data.method,
                headers: JSON.parse(node.data.headers || "{}"),
                bodyschema: JSON.parse(node.data.body || "{}"),
                response: JSON.parse(node.data.response || "{}"),
                success: node.data.success || null,
                failure: node.data.failure || null,
            }));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${Backend_url}admin/apis`, apiNodes, {
                headers: {
                    Authorization: token,
                },
            });

            if (response.data.message) {
                alert("API Flow saved successfully");
            } else {
                alert("Failed to save API flow.");
            }
        } catch (error) {
            console.error("Error saving API flow:", error);
            alert(
                error.response?.data?.message ||
                "Failed to save API flow. Check your inputs."
            );
        }

        try {
            const token = localStorage.getItem('token');
            const body = JSON.stringify({ nodes, edges })
            const response = await axios.post(`${Backend_url}admin/connections`, body, {
                headers: {
                    Authorization: token,
                },
            });

            if (response.ok) {
                console.log('Flow saved successfully.');
            } else {
                console.error('Failed to save flow.');
            }
        } catch (error) {
            console.error('Error saving flow:', error);
        }

    };


    const handleSidebarSave = () => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === selectedNode.id ? selectedNode : node
            )
        );
        setIsSidebarOpen(false);
    };

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
        setIsSidebarOpen(false);
    };


    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <div
                className={`fixed top-0 left-0 h-full w-72 bg-gray-800 text-white transition-transform z-20 duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-4 right-4 text-xl"
                >
                    &times;
                </button>
                <div className="p-4">
                    {selectedNode?.type === "startNode" && (
                        <div className="mt-10 flex flex-col gap-2 group">
                            <label>Start URL:</label>
                            <div className="relative flex flex-col">
                                <input className="bg-gray-800 border-0 cursor-pointer"
                                    onClick={(link) => {
                                        navigator.clipboard.writeText(link.target.value)
                                            .then(() => {
                                                alert('Link copied to clipboard!');
                                            })
                                    }}
                                    value={Backend_url}
                                    contentEditable={false}
                                />
                                <div className="absolute -top-6 right-0 bg-black text-white text-center hidden group-hover:flex gap-1 p-1 w-14 text-xs rounded items-center"><img className=" invert h-3" src="/copy.png" />Copy</div>
                            </div>
                            <button
                                onClick={handleDeleteNode}
                                className="mt-4 ml-4 bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                            >
                                Delete Node
                            </button>
                        </div>

                    )}
                    {selectedNode?.type === "apiNode" && (
                        <div>
                            <h2 className="text-2xl font-bold">Node Configuration</h2>
                            <label>URL:</label>
                            <input
                                value={selectedNode.data.url || ""}
                                onChange={(e) =>
                                    setSelectedNode((prevNode) => ({
                                        ...prevNode,
                                        data: { ...prevNode.data, url: e.target.value },
                                    }))
                                }
                                className="w-full p-2 mt-2 rounded bg-gray-700 text-white"
                            />
                            <label>Method:</label>
                            <select
                                value={selectedNode.data.method || "GET"}
                                onChange={(e) =>
                                    setSelectedNode((prevNode) => ({
                                        ...prevNode,
                                        data: { ...prevNode.data, method: e.target.value },
                                    }))
                                }
                                className="w-full p-2 mt-2 rounded bg-gray-700 text-white"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                            <label>Headers:</label>
                            <textarea
                                value={selectedNode.data.headers || "{}"}
                                onChange={(e) =>
                                    setSelectedNode((prevNode) => ({
                                        ...prevNode,
                                        data: { ...prevNode.data, headers: e.target.value },
                                    }))
                                }
                                className="w-full p-2 mt-2 rounded bg-gray-700 text-white"
                            ></textarea>
                            <label>Body:</label>
                            <textarea
                                value={selectedNode.data.body || "{}"}
                                onChange={(e) =>
                                    setSelectedNode((prevNode) => ({
                                        ...prevNode,
                                        data: { ...prevNode.data, body: e.target.value },
                                    }))
                                }
                                className="w-full p-2 mt-2 rounded bg-gray-700 text-white"
                            ></textarea>
                            <label>Response:</label>
                            <textarea
                                value={selectedNode.data.response || "{}"}
                                onChange={(e) =>
                                    setSelectedNode((prevNode) => ({
                                        ...prevNode,
                                        data: { ...prevNode.data, response: e.target.value },
                                    }))
                                }
                                className="w-full p-2 mt-2 rounded bg-gray-700 text-white"
                            ></textarea>
                            <button
                                onClick={handleSidebarSave}
                                className="mt-4 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                            >
                                Save
                            </button>
                            {/* Delete Node Button */}
                            <button
                                onClick={handleDeleteNode}
                                className="mt-4 ml-4 bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                            >
                                Delete Node
                            </button>
                        </div>
                    )}
                </div>

            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={customNodeTypes}
                edgeTypes={customEdgeTypes}
                style={{ background: "white" }}
            >
                <Background />
            </ReactFlow>
            <div className="z-10 fixed right-10 top-5 flex items-center gap-10">
                    <div className="text-black text-lg"><span className="text-black font-bold ">Welcome ,</span>{window.localStorage.getItem("user")}</div>
                <div className="flex flex-col group gap-1">
                    <img className="h-16 cursor-pointer" src="/profile.png" />
                    <button onClick={() => {
                        window.location.href = '/'
                        window.localStorage.setItem('token', '')
                        window.localStorage.setItem('user', '')
                    }} className="bg-[#e28086] hidden group-hover:block cursor-pointer  rounded-md p-1 text-white">Log Out</button>
                </div>
            </div>
            <div className="fixed bottom-4 right-4 flex gap-4">
                <button onClick={addStartNode} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add Start Node
                </button>
                {startnode &&

                    <button onClick={addApiNode} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                        Add API Node
                    </button>
                }
                <button onClick={handleSaveFlow} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Save API Flow
                </button>
            </div>
        </div>
    );
}

export default AdminPanel;

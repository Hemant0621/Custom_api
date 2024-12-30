const { Handle } = require("react-flow-renderer");

const customNodeTypes = {
    startNode: ({ data }) => (
        <div className="w-28 h-12 bg-gray-200 rounded flex items-center justify-center">
            <div className="">{data.label}</div>
            <Handle
                type="source"
                position="right"
                id="out"
                style={{ width: "10px", height: "10px", border: "2px solid black", top: "50%", background: "blue" }}
            />
        </div>
    ),

    apiNode: ({ data }) => (
        <div className=" border w-44 h-44 bg-white rounded shadow">
            <div className="bg-gray-200 py-1 font-bold border-black border-b text-center">{data.label}</div>

            <div className="py-1 px-1 flex gap-2 border items-center border-gray-500 m-2 rounded-lg">
                {data.method && <div className="text-blue-600 font-normal">{data.method}</div>}
                {data.url && <div className="text-sm text-gray-500">{data.url}</div>}
            </div>

            <Handle
                type="target"
                position="left"
                id="in"
                style={{ width: "10px", height: "10px", border: "2px solid black", top: "50%", background: "blue" }}
            />
            <Handle
                type="source"
                position="right"
                id="success"
                style={{ width: "10px", height: "10px", border: "2px solid black", top: "75%", background: "green" }}
            >
                <div className="absolute -left-12 -top-2 text-xs text-green-500">Success</div>
            </Handle>
            <Handle
                type="source"
                position="right"
                id="failure"
                style={{ width: "10px", height: "10px", border: "2px solid black", top: "90%", background: "red" }}
            >
                <div className="absolute -left-12 -top-2 text-xs text-red-500">Failure</div>
            </Handle>
        </div>
    ),
};

module.exports = {customNodeTypes}
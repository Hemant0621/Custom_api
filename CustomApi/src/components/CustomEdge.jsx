const { getBezierPath } = require("react-flow-renderer");


const customEdgeTypes = {
    CrossEdge: ({
        id,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        style,
        markerEnd,
        data,
    }) => {
        const [edgePath, labelX, labelY] = getBezierPath({
            sourceX,
            sourceY,
            targetX,
            targetY,
            sourcePosition,
            targetPosition,
        });

        return (
            <>
                <path
                    id={id}
                    style={style}
                    className="react-flow__edge-path"
                    d={edgePath}
                    markerEnd={markerEnd}
                />
                <foreignObject
                    width={25}
                    height={25}
                    x={labelX - 10}
                    y={labelY - 10}
                    className="delete-button"
                >
                    <div
                        onClick={() => {
                            setEdges((es) => es.filter((e) => e.id !== id));
                        }}
                        className=" bg-white rounded-sm border border-black "
                    >
                        <img className="p-1" src="/delete.png" alt="delete" />
                    </div>
                </foreignObject>
            </>
        );
    },
};

module.exports = {customEdgeTypes}
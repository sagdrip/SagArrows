import { LogicNode } from "../logic/node";

export namespace NodeRestructuring { // TODO: Preserve signals & make some fixes for pink arrows
    export function splitNode(nodes: Set<LogicNode>, node: LogicNode, offset: number) {
        return spliceNode(nodes, node, offset, 0);
    }
    
    export function spliceNode(nodes: Set<LogicNode>, node: LogicNode, offset: number, count: number = 1) {
        const endOffset = offset + count;
        const nodeA = offset > 0 ?
                        new LogicNode(node.arrows.slice(0, offset), node.type, offset) : null;
        const nodeB = endOffset < node.size - 1 ?
                        new LogicNode(node.arrows.slice(endOffset), 0, node.size - endOffset) : null;
        nodes.delete(node);
        if (nodeA) {
            nodes.add(nodeA);
            if (nodeA.targets.length === 1 && nodeA.targets[0].type === 0 && nodeA.targets[0].sources.length === 1) {
                const [target] = nodeA.targets;
                nodes.delete(target);
                nodeA.resize(nodeA.size + target.size);
                nodeA.arrows.push(...target.arrows);
                nodeA.targets.push(...target.targets);
                for (const arrow of target.arrows)
                    arrow.offset += node.size;
            }
            for (const source of node.sources) {
                source.targets.splice(source.targets.indexOf(node), 1);
                nodeA.sources.push(source);
                source.targets.push(nodeA);
            }
            for (const arrow of nodeA.arrows) {
                arrow.node = nodeA;
            }
        }
        if (nodeB) {
            nodes.add(nodeB);
            for (const target of node.targets) {
                target.sources.splice(target.sources.indexOf(node), 1);
                nodeB.targets.push(target);
                target.sources.push(nodeB);
            }
            for (const arrow of nodeB.arrows) {
                arrow.node = nodeB;
                arrow.offset -= endOffset;
            }
        }
        return [nodeA, nodeB];
    }

    export function insertNode(nodes: Set<LogicNode>, node: LogicNode, targets: [LogicNode, number][], sources: LogicNode[]) {
        if (sources.length === 1 && node.type === 0) {
            const [source] = sources;
            nodes.delete(source);
            node.resize(source.size + node.size);
            node.arrows.unshift(...source.arrows);
            node.sources.push(...source.sources);
        } else {
            for (const source of sources) {
                node.sources.push(source);
                source.targets.push(node);
            }
        }
        if (targets.length === 1) {
            const [[target, offset]] = targets;
            const [, targetNode] = splitNode(nodes, target, offset);
            if (targetNode.type === 0 && targetNode.sources.length === 0) {
                nodes.delete(targetNode);
                node.resize(node.size + targetNode.size);
                node.arrows.push(...targetNode.arrows);
                node.targets.push(...targetNode.targets);
                for (const arrow of targetNode.arrows)
                    arrow.offset += node.size;
            } else {
                targetNode.sources.push(node);
                node.targets.push(targetNode);
            }
        } else {
            for (const [target, offset] of targets) {
                const [, targetNode] = splitNode(nodes, target, offset);
                targetNode.sources.push(node);
                node.targets.push(targetNode);
            }
        }
        nodes.add(node);
    }

    export function updateNode(nodes: Set<LogicNode>, node: LogicNode, type: number) {
        nodes.delete(node);
        const newNode = new LogicNode(node.arrows, type, node.size);
        if (node.sources.length === 1 && type === 0) {
            const [source] = node.sources;
            nodes.delete(source);
            newNode.resize(source.size + node.size);
            newNode.arrows.unshift(...source.arrows);
            newNode.sources.push(...source.sources);
        } else {
            for (const source of node.sources) {
                source.targets.splice(source.targets.indexOf(node), 1);
                newNode.sources.push(source);
                source.targets.push(newNode);
            }
        }
        for (const target of node.targets) {
            target.sources.splice(target.sources.indexOf(node), 1);
            newNode.targets.push(target);
            target.sources.push(newNode);
        }
        for (const arrow of node.arrows) {
            arrow.node = newNode;
        }
        nodes.add(newNode);
        return newNode;
    }
}
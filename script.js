const gridContainer = document.getElementById('grid');
const rows = 22, cols = 40;
let startPos = { r: 11, c: 5 }, targetPos = { r: 11, c: 34 };
let portalA = null, portalB = null;
let isPainting = false, isDraggingStart = false, isDraggingTarget = false;
let isRunning = false;
let hasVisualized = false;

function init() {
    if (isRunning) return;
    gridContainer.innerHTML = '';
    portalA = portalB = null;
    hasVisualized = false;
    resetStats();
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const node = document.createElement('div');
            node.id = `node-${r}-${c}`;
            node.className = 'node';
            if (r === startPos.r && c === startPos.c) node.classList.add('node-start');
            if (r === targetPos.r && c === targetPos.c) node.classList.add('node-target');
            
            node.onmousedown = (e) => handleMouseDown(e, r, c);
            node.onmouseenter = () => handleMouseEnter(r, c);
            node.onmouseup = () => handleMouseUp();
            gridContainer.appendChild(node);
        }
    }
}

function handleMouseDown(e, r, c) {
    if (isRunning) return;
    e.preventDefault();
    if (r === startPos.r && c === startPos.c) isDraggingStart = true;
    else if (r === targetPos.r && c === targetPos.c) isDraggingTarget = true;
    else { isPainting = true; toggleWall(r, c); }
}

function handleMouseEnter(r, c) {
    if (isRunning) return;
    if (isDraggingStart) {
        moveNode(r, c, 'start');
        if (hasVisualized) runInstant();
    } else if (isDraggingTarget) {
        moveNode(r, c, 'target');
        if (hasVisualized) runInstant();
    } else if (isPainting) {
        toggleWall(r, c);
        if (hasVisualized) runInstant();
    }
}

function handleMouseUp() {
    isPainting = isDraggingStart = isDraggingTarget = false;
}

function moveNode(r, c, type) {
    const node = document.getElementById(`node-${r}-${c}`);
    if (node.classList.contains('node-wall')) return;
    if (type === 'start') {
        document.getElementById(`node-${startPos.r}-${startPos.c}`).classList.remove('node-start');
        startPos = { r, c }; node.classList.add('node-start');
    } else {
        document.getElementById(`node-${targetPos.r}-${targetPos.c}`).classList.remove('node-target');
        targetPos = { r, c }; node.classList.add('node-target');
    }
}

function toggleWall(r, c) {
    const node = document.getElementById(`node-${r}-${c}`);
    if (node.classList.contains('node-start') || node.classList.contains('node-target')) return;
    node.classList.toggle('node-wall');
}

function runInstant() {
    document.querySelectorAll('.node-visited, .node-path').forEach(el => el.classList.remove('node-visited', 'node-path'));
    const algo = document.getElementById('algo-select').value;
    const startTime = performance.now();
    
    let result = solveSync(algo);
    if (result) {
        result.path.forEach(n => document.getElementById(`node-${n.r}-${n.c}`).classList.add('node-path'));
        document.getElementById('stat-time').innerText = `${(performance.now() - startTime).toFixed(1)}ms`;
        document.getElementById('stat-cost').innerText = result.path.length;
        document.getElementById('stat-nodes').innerText = result.explored;
    }
}

async function visualize() {
    if (isRunning) return;
    isRunning = true;
    hasVisualized = true;
    document.querySelectorAll('.node-visited, .node-path').forEach(el => el.classList.remove('node-visited', 'node-path'));
    
    const algo = document.getElementById('algo-select').value;
    const startTime = performance.now();
    let openSet = [startPos], cameFrom = new Map(), gScore = new Map(), fScore = new Map(), explored = 0;
    const h = (p) => (algo === 'astar') ? Math.abs(p.r - targetPos.r) + Math.abs(p.c - targetPos.c) : 0;
    
    gScore.set(`${startPos.r},${startPos.c}`, 0);
    fScore.set(`${startPos.r},${startPos.c}`, h(startPos));

    while (openSet.length > 0) {
        if (algo !== 'dfs') openSet.sort((a,b) => fScore.get(`${a.r},${a.c}`) - fScore.get(`${b.r},${b.c}`));
        let curr = (algo === 'dfs') ? openSet.pop() : openSet.shift();

        if (curr.r === targetPos.r && curr.c === targetPos.c) {
            const path = reconstructPath(cameFrom);
            // FIX: Update the Path Cost stat here
            document.getElementById('stat-cost').innerText = path.length;
            
            for (let n of path) {
                document.getElementById(`node-${n.r}-${n.c}`).classList.add('node-path');
                await new Promise(r => setTimeout(r, 20));
            }
            isRunning = false; return;
        }

        let neighbors = getNeighbors(curr);
        for (let next of neighbors) {
            let key = `${next.r},${next.c}`;
            let tg = gScore.get(`${curr.r},${curr.c}`) + 1;
            if (tg < (gScore.get(key) || Infinity)) {
                cameFrom.set(key, curr);
                gScore.set(key, tg);
                fScore.set(key, tg + h(next));
                if (!openSet.find(n => n.r === next.r && n.c === next.c)) {
                    openSet.push(next);
                    explored++;
                    updateStats(explored, performance.now() - startTime);
                    const el = document.getElementById(`node-${next.r}-${next.c}`);
                    if (!el.classList.contains('node-start') && !el.classList.contains('node-target')) el.classList.add('node-visited');
                    await new Promise(r => setTimeout(r, 10));
                }
            }
        }
    }
    isRunning = false;
}

function getNeighbors(curr) {
    let n = [[0,1],[1,0],[0,-1],[-1,0]].map(([dr, dc]) => ({r: curr.r + dr, c: curr.c + dc}))
        .filter(p => p.r >= 0 && p.r < rows && p.c >= 0 && p.c < cols && !document.getElementById(`node-${p.r}-${p.c}`).classList.contains('node-wall'));
    if (portalA && portalB) {
        if (curr.r === portalA.r && curr.c === portalA.c) n.push(portalB);
        else if (curr.r === portalB.r && curr.c === portalB.c) n.push(portalA);
    }
    return n;
}

function solveSync(algo) {
    let openSet = [startPos], cameFrom = new Map(), gScore = new Map(), fScore = new Map(), explored = 0;
    const h = (p) => (algo === 'astar') ? Math.abs(p.r - targetPos.r) + Math.abs(p.c - targetPos.c) : 0;
    gScore.set(`${startPos.r},${startPos.c}`, 0);
    fScore.set(`${startPos.r},${startPos.c}`, h(startPos));

    while (openSet.length > 0) {
        if (algo !== 'dfs') openSet.sort((a,b) => fScore.get(`${a.r},${a.c}`) - fScore.get(`${b.r},${b.c}`));
        let curr = (algo === 'dfs') ? openSet.pop() : openSet.shift();
        if (curr.r === targetPos.r && curr.c === targetPos.c) return { path: reconstructPath(cameFrom), explored };

        for (let next of getNeighbors(curr)) {
            let key = `${next.r},${next.c}`, tg = gScore.get(`${curr.r},${curr.c}`) + 1;
            if (tg < (gScore.get(key) || Infinity)) {
                cameFrom.set(key, curr); gScore.set(key, tg); fScore.set(key, tg + h(next));
                if (!openSet.find(n => n.r === next.r && n.c === next.c)) {
                    openSet.push(next); explored++;
                    const el = document.getElementById(`node-${next.r}-${next.c}`);
                    if (!el.classList.contains('node-start') && !el.classList.contains('node-target')) el.classList.add('node-visited');
                }
            }
        }
    }
    return null;
}

function reconstructPath(cameFrom) {
    let path = [], curr = targetPos;
    while (cameFrom.has(`${curr.r},${curr.c}`)) {
        curr = cameFrom.get(`${curr.r},${curr.c}`);
        if (curr.r === startPos.r && curr.c === startPos.c) break;
        path.unshift(curr);
    }
    return path;
}

function updateStats(n, t) {
    document.getElementById('stat-nodes').innerText = n;
    document.getElementById('stat-time').innerText = `${Math.round(t)}ms`;
}

function resetStats() {
    document.getElementById('stat-nodes').innerText = '0';
    document.getElementById('stat-cost').innerText = '0';
    document.getElementById('stat-time').innerText = '0ms';
}

document.getElementById('theme-toggle').onclick = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('theme-toggle').innerText = isDark ? '☀️' : '🌙';
};

document.getElementById('start-btn').onclick = visualize;
document.getElementById('clear-btn').onclick = init;
document.getElementById('maze-btn').onclick = () => {
    init();
    for(let i=0; i<300; i++) {
        const r = Math.floor(Math.random()*rows), c = Math.floor(Math.random()*cols);
        if (!(r === startPos.r && c === startPos.c) && !(r === targetPos.r && c === targetPos.c)) 
            document.getElementById(`node-${r}-${c}`).classList.add('node-wall');
    }
    if (document.getElementById('portal-toggle').checked) {
        portalA = {r: Math.floor(rows/2), c: 10}; portalB = {r: Math.floor(rows/2), c: 30};
        document.getElementById(`node-${portalA.r}-${portalA.c}`).className = 'node node-portal-a';
        document.getElementById(`node-${portalB.r}-${portalB.c}`).className = 'node node-portal-b';
    }
};

init();
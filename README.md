# Path Visualizer

An interactive **pathfinding algorithm visualizer** built using **vanilla JavaScript, HTML, and CSS**. This tool helps you understand how popular graph traversal algorithms work in real-time with a clean, modern UI.

---

## ✨ Features

* 🔍 Visualize multiple algorithms:

  * A* Search
  * Dijkstra’s Algorithm
  * Breadth-First Search (BFS)
  * Depth-First Search (DFS)

* 🎯 Interactive grid:

  * Drag & reposition **start** and **target** nodes
  * Draw/remove walls dynamically
  * Real-time updates after visualization

* 🧠 Smart visualization:

  * Animated node exploration
  * Highlighted shortest path
  * Performance metrics:

    * Nodes explored
    * Path cost
    * Execution time

* 🌀 Advanced mechanics:

  * Optional **portal system** (teleport between nodes)
  * Random **maze generation**

* 🌗 Theme support:

  * Toggle between **light** and **dark mode**

---

## 🖥️ Demo Preview

> Open `index.html` in your browser to run the project locally.

---

## 📁 Project Structure

```id="g6m6jw"
📦 path-visualizer
 ┣ 📄 index.html
 ┣ 📄 style.css
 ┗ 📄 script.js
```

---

## ⚙️ How It Works

* The grid is dynamically generated using JavaScript

* Algorithms operate on a **2D grid graph**

* Each node tracks:

  * Distance (`gScore`)
  * Heuristic (`fScore`) for A*

* Visualization flow:

  1. Explore nodes step-by-step
  2. Mark visited nodes
  3. Reconstruct shortest path

---

## 🧪 Algorithms Implemented

* A* Search
* Dijkstra’s Algorithm
* BFS (Breadth-First Search)
* DFS (Depth-First Search)

---

## 🎮 Controls

| Action         | Description       |
| -------------- | ----------------- |
| Click + Drag   | Draw walls        |
| Drag Nodes     | Move start/target |
| Visualize      | Run algorithm     |
| Generate Maze  | Create obstacles  |
| Clear All      | Reset grid        |
| Toggle Portals | Enable portals    |

---

## 📊 Stats

* **Explored** → Nodes visited
* **Path Cost** → Shortest path length
* **Latency** → Execution time

---

## 🛠️ Tech Stack

* HTML5
* CSS3
* JavaScript

---

## 📜 License

Open-source and free to use.

let treeData = null;

const API = "http://localhost:3000/api/v1/tree";
const USERS_API = "http://localhost:3000/api/v1/users";

async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        credentials: "include"
    });

    if (res.status === 401) {
        window.location.href = "login.html";
        return null;
    }

    return res;
}

async function requireAuth() {
    const res = await apiFetch(`${USERS_API}/current-user`);
    if (!res) return false;
    return res.ok;
}

async function logout() {
    await apiFetch(`${USERS_API}/logout`, { method: "POST" });
    window.location.href = "login.html";
}

async function loadTree() {
    try {
        const res = await apiFetch(`${API}/load`);
        if(!res) return;

        const body = await res.json();
        const rows = body.data;

        treeData = buildTree(rows);

        if (!treeData) {
            rootInput.style.display = "inline-block";
            createBtn.style.display = "inline-block";
            resetBtn.style.display = "none";
        }
        else {
            rootInput.style.display = "none";
            createBtn.style.display = "none";
            resetBtn.style.display = "inline-block";
        }

        updateTree();
    }
    catch (err) {
        console.log(err);
    }

}

function buildTree(rows) {
    if (!rows || !rows.length) return null;

    const map = {};

    rows.forEach(r => {
        map[r._id] = {
            id: r._id,
            name: r.name,
            children: []
        };
    });

    let root = null;

    rows.forEach(r => {
        if (r.parent === null) {
            root = map[r._id];
        } else {
            map[r.parent].children.push(map[r._id]);
        }
    });

    return root;
}



let width = window.innerWidth;
let height = window.innerHeight;

const svg = d3.select("#tree")
    .attr("width", width)
    .attr("height", height);

const g = svg.append("g")
    .attr("transform", `translate(${window.innerWidth / 2},200)`);

const zoom = d3.zoom()
    .scaleExtent([0.2, 3])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

svg.call(zoom);

async function createRoot() {

    if (treeData !== null) {
        alert("Root already exists");
        return;
    }

    let val =
        document.getElementById("rootInput").value;

    if (val.trim() === "") {
        alert("Enter root value");
        return;
    }

    createBtn.disabled = true;

    try {
        const res = await apiFetch(
            `${API}/root`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
 
            body: JSON.stringify({
                name: val
            })
        });
        if (!res) return;
 
        if (!res.ok) {
            const body = await res.json();
            alert(body.message || "Failed to create root");
            return;
        }
 
        await loadTree();
    }
    finally {
        createBtn.disabled = false;
    }
}

function updateTree() {

    g.selectAll("*").remove();

    if (treeData === null) return;

    const root =
        d3.hierarchy(treeData);

    const treeLayout =
        d3.tree().nodeSize([180, 120]);

    treeLayout(root);

    g.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        )
        .style("opacity", 0)
        .transition()
        .duration(700)
        .style("opacity", 1);

    const node =
        g.selectAll(".node")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform",
                d => `translate(${d.x},${d.y})`
            )
            .style("opacity", 0);

    node.transition()
        .duration(700)
        .style("opacity", 1);

    node.append("rect")
        .attr("x", -70)
        .attr("y", -25)
        .attr("width", 140)
        .attr("height", 80)
        .style("filter",
            "drop-shadow(0px 3px 6px rgba(0,0,0,0.2))"
        );

    node.append("text")
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .text(d => d.data.name);

    node.append("text")
        .attr("class", "action-btn")
        .attr("x", -55)
        .attr("y", 34)
        .text("ᴬᴰᴰ")
        .on("click", async (event, d) => {

            event.stopPropagation();
            let child = prompt("Enter child node");

            if (child === null || child.trim() === "") return;

            const res = await apiFetch(
                `${API}/node`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: child,
                    parent_id: d.data.id
                })
            });
            if (!res) return;

            await loadTree();
        });

    node.append("text")
        .attr("class", "action-btn")
        .attr("x", -10)
        .attr("y", 34)
        .text("ᴱᴰᴵᵀ")
        .on("click", async (event, d) => {

            event.stopPropagation();

            let newVal =
                prompt(
                    "Update node",
                    d.data.name
                );

            if (
                newVal === null
                ||
                newVal.trim() === ""
            ) return;

            const res = await apiFetch(
                `${API}/node/${d.data.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newVal })
            });
            if (!res) return;

            await loadTree();
        });

    node.append("text")
        .attr("class", "action-btn")
        .attr("x", 38)
        .attr("y", 34)
        .text("ᴰᴱᴸ")
        .on("click", async (event, d) => {
            event.stopPropagation();

            if (confirm("Delete?")) {
                const res = await apiFetch(
                    `${API}/node/${d.data.id}`, {
                    method: "DELETE"
                });
                if (!res) return;

                await loadTree();
            }
        });
}


async function resetTree() {
    if (treeData) {
        const res = await apiFetch(
            `${API}/node/${treeData.id}`, {
            method: "DELETE"
        });
        if (!res) return;

        await loadTree();
    }
}

window.addEventListener("resize", async () => {

    width = window.innerWidth;
    height = window.innerHeight;

    svg.attr("width", width)
        .attr("height", height);

    await loadTree();
});

(async function init() {
    const authed = await requireAuth();
    if (!authed) return; 

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    await loadTree();
})();
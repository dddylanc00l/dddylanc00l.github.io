const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");

let width;
let height;

let branches = [];
let leaves = [];

const MAX_GENERATIONS = 7;

function resizeCanvas() {

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    draw();
}

window.addEventListener("resize", resizeCanvas);

function createStem() {

    branches = [];
    leaves = [];

    const x = width / 2;

    branches.push({

        x1: x,
        y1: height - 50,

        x2: x,
        y2: height - 350,

        width: 25,

        generation: 1,

        branched: false,

        hasLeaf: false
    });
}

function draw() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    ctx.fillStyle = "#79b85a";

    ctx.fillRect(
        0,
        height - 50,
        width,
        50
    );

    for (const branch of branches) {
        drawBranch(branch);
    }

    for (const leaf of leaves) {
        drawLeaf(leaf);
    }
}

function drawBranch(branch) {

    ctx.beginPath();

    ctx.moveTo(
        branch.x1,
        branch.y1
    );

    ctx.lineTo(
        branch.x2,
        branch.y2
    );

    ctx.strokeStyle = "#70452a";

    ctx.lineWidth = branch.width;

    ctx.lineCap = "round";

    ctx.stroke();
}

function drawLeaf(leaf) {

    ctx.save();

    ctx.translate(
        leaf.x,
        leaf.y
    );

    ctx.rotate(
        leaf.angle
    );

    ctx.beginPath();

    ctx.moveTo(0, 0);

    ctx.quadraticCurveTo(
        18,
        -22,
        48,
        -5
    );

    ctx.quadraticCurveTo(
        28,
        15,
        0,
        0
    );

    ctx.fillStyle = "#2f8f46";

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(0, 0);

    ctx.lineTo(40, -5);

    ctx.strokeStyle = "#236b35";

    ctx.lineWidth = 2;

    ctx.stroke();


    ctx.restore();
}

canvas.addEventListener(
    "click",
    function(event) {

        const rect =
            canvas.getBoundingClientRect();

        const mouseX =
            event.clientX - rect.left;

        const mouseY =
            event.clientY - rect.top;


        let closestBranch = null;

        let closestDistance = Infinity;

        for (const branch of branches) {

            if (branch.branched) {
                continue;
            }

            if (branch.hasLeaf) {
                continue;
            }


            const result =
                distanceToBranch(
                    mouseX,
                    mouseY,
                    branch
                );


            const clickRadius =
                branch.width / 2 + 10;


            if (
                result.distance < clickRadius &&
                result.distance < closestDistance
            ) {

                closestDistance =
                    result.distance;

                closestBranch = {

                    branch: branch,

                    t: result.t
                };
            }
        }


        if (!closestBranch) {
            return;
        }


        splitBranch(
            closestBranch.branch,
            closestBranch.t
        );


        draw();
    }
);

function splitBranch(branch, t) {


    if (branch.branched) {
        return;
    }

    if (branch.hasLeaf) {
        return;
    }

    if (t < 0.12) {
        return;
    }

    const x =
        branch.x1 +
        (branch.x2 - branch.x1) * t;

    const y =
        branch.y1 +
        (branch.y2 - branch.y1) * t;

    const dx =
        branch.x2 - branch.x1;

    const dy =
        branch.y2 - branch.y1;


    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (length < 30) {
        return;
    }


    const angle =
        Math.atan2(
            dy,
            dx
        );

    branch.x2 = x;
    branch.y2 = y;



    branch.branched = true;

    if (branch.generation >= MAX_GENERATIONS) {

        addLeaf(
            x,
            y,
            angle
        );

        branch.hasLeaf = true;

        return;
    }

    const newGeneration =
        branch.generation + 1;


    const newLength =
        Math.max(
            35,
            length * t * 0.8
        );


    const newWidth =
        Math.max(
            4,
            branch.width * 0.55
        );

    const leftAngle =
        angle - 0.55;


    branches.push({

        x1: x,
        y1: y,

        x2:
            x +
            Math.cos(leftAngle) *
            newLength,

        y2:
            y +
            Math.sin(leftAngle) *
            newLength,

        width: newWidth,

        generation: newGeneration,

        branched: false,

        hasLeaf: false
    });

    const rightAngle =
        angle + 0.55;


    branches.push({

        x1: x,
        y1: y,

        x2:
            x +
            Math.cos(rightAngle) *
            newLength,

        y2:
            y +
            Math.sin(rightAngle) *
            newLength,

        width: newWidth,

        generation: newGeneration,

        branched: false,

        hasLeaf: false
    });
}

function addLeaf(x, y, angle) {

    leaves.push({

        x: x,
        y: y,

        angle: angle
    });
}

function distanceToBranch(
    px,
    py,
    branch
) {

    const x1 = branch.x1;
    const y1 = branch.y1;

    const x2 = branch.x2;
    const y2 = branch.y2;


    const dx = x2 - x1;
    const dy = y2 - y1;


    const lengthSquared =
        dx * dx +
        dy * dy;


    if (lengthSquared === 0) {

        return {

            distance: Math.hypot(
                px - x1,
                py - y1
            ),

            t: 0
        };
    }


    let t =
        (
            (px - x1) * dx +
            (py - y1) * dy
        ) /
        lengthSquared;


    t = Math.max(
        0,
        Math.min(1, t)
    );


    const closestX =
        x1 + t * dx;

    const closestY =
        y1 + t * dy;


    const distance =
        Math.hypot(
            px - closestX,
            py - closestY
        );


    return {

        distance: distance,

        t: t
    };
}

document
    .getElementById("reset")
    .addEventListener(
        "click",
        function() {

            createStem();

            draw();
        }
    );

resizeCanvas();

createStem();

draw();

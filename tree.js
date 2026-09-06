const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;

let branches = [];
let leaves = [];

const MAX_GENERATIONS = 7;


// ==================================================
// ZOOM
// ==================================================

let zoom = 1;

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;


// ==================================================
// POINTERS
// ==================================================

const pointers = new Map();

let pinchStartDistance = 0;
let pinchStartZoom = 1;


// ==================================================
// CANVAS RESIZE
// ==================================================

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const newWidth =
        rect.width;

    const newHeight =
        rect.height;


    // First setup

    if (width === 0 || height === 0) {

        width = newWidth;
        height = newHeight;

        setupCanvasResolution();

        createStem();

        draw();

        return;
    }


    const deltaX =
        newWidth - width;

    const deltaY =
        newHeight - height;


    width = newWidth;
    height = newHeight;


    setupCanvasResolution();


    /*
        Move the existing tree so that:

        - It remains horizontally centered
        - Its base remains attached to the ground
    */

    const moveX =
        deltaX / 2;

    const moveY =
        deltaY;


    for (const branch of branches) {

        branch.x1 += moveX;
        branch.x2 += moveX;

        branch.y1 += moveY;
        branch.y2 += moveY;
    }


    for (const leaf of leaves) {

        leaf.x += moveX;
        leaf.y += moveY;
    }


    draw();
}


// ==================================================
// HIGH DPI
// ==================================================

function setupCanvasResolution() {

    const dpr =
        Math.max(
            1,
            window.devicePixelRatio || 1
        );


    canvas.width =
        Math.round(
            width * dpr
        );

    canvas.height =
        Math.round(
            height * dpr
        );


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

function getInitialTreeHeight() {
  // Small devices / phones
  if (width <= 600) {
    return Math.min(220, height * 0.35);
  }

  // Tablets / smaller laptops
  if (width <= 900) {
    return Math.min(280, height * 0.40);
  }

  // Desktop
  return Math.min(350, Math.max(150, height * 0.45));
}

// ==================================================
// CREATE STEM
// ==================================================

function createStem() {

    branches = [];
    leaves = [];


    const x =
        width / 2;


    /*
        Responsive starting stem.

        On small screens it becomes shorter.
    */

    const stemLength = getInitialTreeHeight();


    branches.push({

        x1: x,
        y1: height - 50,

        x2: x,
        y2:
            height -
            50 -
            stemLength,

        width:
            Math.min(
                25,
                Math.max(
                    14,
                    width * 0.035
                )
            ),

        generation: 1,

        branched: false,

        hasLeaf: false
    });
}


// ==================================================
// DRAW
// ==================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // ------------------------------------------
    // Ground
    // ------------------------------------------

    ctx.fillStyle =
        "#79b85a";


    ctx.fillRect(
        0,
        height - 50,
        width,
        50
    );


    // ------------------------------------------
    // TREE
    // ------------------------------------------

    ctx.save();


    /*
        IMPORTANT:

        The zoom origin is the BASE of the tree,
        not the center of the screen.

        This means the tree shrinks upward
        while its base stays fixed on the ground.
    */

    const groundX =
        width / 2;

    const groundY =
        height - 50;


    ctx.translate(
        groundX,
        groundY
    );


    ctx.scale(
        zoom,
        zoom
    );


    ctx.translate(
        -groundX,
        -groundY
    );


    // Draw branches

    for (const branch of branches) {

        drawBranch(branch);
    }


    // Draw leaves

    for (const leaf of leaves) {

        drawLeaf(leaf);
    }


    ctx.restore();
}


// ==================================================
// DRAW BRANCH
// ==================================================

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


    ctx.strokeStyle =
        "#70452a";


    ctx.lineWidth =
        branch.width;


    ctx.lineCap =
        "round";


    ctx.stroke();
}


// ==================================================
// DRAW LEAF
// ==================================================

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


    ctx.moveTo(
        0,
        0
    );


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


    ctx.fillStyle =
        "#2f8f46";


    ctx.fill();


    // Leaf vein

    ctx.beginPath();


    ctx.moveTo(
        0,
        0
    );


    ctx.lineTo(
        40,
        -5
    );


    ctx.strokeStyle =
        "#236b35";


    ctx.lineWidth =
        2;


    ctx.stroke();


    ctx.restore();
}


// ==================================================
// SCREEN → TREE COORDINATES
// ==================================================

function screenToWorld(
    screenX,
    screenY
) {

    const rect =
        canvas.getBoundingClientRect();


    const canvasX =
        screenX -
        rect.left;


    const canvasY =
        screenY -
        rect.top;


    /*
        The zoom origin is the ground.

        Reverse the exact same transformation
        used by draw().
    */

    const groundX =
        width / 2;

    const groundY =
        height - 50;


    const worldX =
        (
            canvasX -
            groundX
        ) /
        zoom +
        groundX;


    const worldY =
        (
            canvasY -
            groundY
        ) /
        zoom +
        groundY;


    return {

        x: worldX,

        y: worldY
    };
}


// ==================================================
// SET ZOOM
// ==================================================

function setZoom(
    newZoom
) {

    zoom =
        Math.max(
            MIN_ZOOM,
            Math.min(
                MAX_ZOOM,
                newZoom
            )
        );


    draw();
}


// ==================================================
// MOUSE WHEEL
// ==================================================

canvas.addEventListener(
    "wheel",
    function(event) {

        event.preventDefault();


        /*
            Scroll down = zoom out
            Scroll up   = zoom in
        */

        const zoomFactor =
            event.deltaY < 0
                ? 1.1
                : 0.9;


        setZoom(
            zoom * zoomFactor
        );
    },
    {
        passive: false
    }
);


// ==================================================
// POINTER DOWN
// ==================================================

canvas.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();


        pointers.set(
            event.pointerId,
            {
                x: event.clientX,
                y: event.clientY
            }
        );


        try {

            canvas.setPointerCapture(
                event.pointerId
            );

        }
        catch (error) {
            // Ignore unsupported pointer capture
        }


        // Start pinch

        if (pointers.size === 2) {

            const points =
                Array.from(
                    pointers.values()
                );


            pinchStartDistance =
                Math.hypot(
                    points[1].x -
                    points[0].x,

                    points[1].y -
                    points[0].y
                );


            pinchStartZoom =
                zoom;
        }
    },
    {
        passive: false
    }
);


// ==================================================
// POINTER MOVE
// ==================================================

canvas.addEventListener(
    "pointermove",
    function(event) {

        if (!pointers.has(event.pointerId)) {
            return;
        }


        event.preventDefault();


        pointers.set(
            event.pointerId,
            {
                x: event.clientX,
                y: event.clientY
            }
        );


        /*
            ONLY pinch zoom.

            There is deliberately NO panning.
        */

        if (pointers.size === 2) {

            const points =
                Array.from(
                    pointers.values()
                );


            const distance =
                Math.hypot(
                    points[1].x -
                    points[0].x,

                    points[1].y -
                    points[0].y
                );


            if (
                pinchStartDistance > 0
            ) {

                const scale =
                    distance /
                    pinchStartDistance;


                const newZoom =
                    pinchStartZoom *
                    scale;


                setZoom(
                    newZoom
                );
            }
        }
    },
    {
        passive: false
    }
);


// ==================================================
// POINTER UP
// ==================================================

canvas.addEventListener(
    "pointerup",
    function(event) {

        const pointer =
            pointers.get(
                event.pointerId
            );


        pointers.delete(
            event.pointerId
        );


        try {

            canvas.releasePointerCapture(
                event.pointerId
            );

        }
        catch (error) {
            // Ignore unsupported pointer capture
        }


        /*
            A single pointer release is a branch click.

            A pinch ends without creating a branch.
        */

        if (
            pointer &&
            pointers.size === 0
        ) {

            handleBranchClick(
                pointer.x,
                pointer.y
            );
        }


        if (pointers.size < 2) {

            pinchStartDistance = 0;
        }
    },
    {
        passive: false
    }
);


// ==================================================
// POINTER CANCEL
// ==================================================

canvas.addEventListener(
    "pointercancel",
    function(event) {

        pointers.delete(
            event.pointerId
        );


        if (pointers.size < 2) {

            pinchStartDistance = 0;
        }
    }
);


// ==================================================
// BRANCH CLICK
// ==================================================

function handleBranchClick(
    screenX,
    screenY
) {

    const point =
        screenToWorld(
            screenX,
            screenY
        );


    const mouseX =
        point.x;

    const mouseY =
        point.y;


    let closestBranch =
        null;

    let closestDistance =
        Infinity;


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


        /*
            Large touch area for mobile.
        */

        const clickRadius =
            branch.width / 2 +
            18;


        if (
            result.distance <
                clickRadius &&

            result.distance <
                closestDistance
        ) {

            closestDistance =
                result.distance;


            closestBranch = {

                branch:
                    branch,

                t:
                    result.t
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


// ==================================================
// SPLIT BRANCH
// ==================================================

function splitBranch(
    branch,
    t
) {

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
        (
            branch.x2 -
            branch.x1
        ) *
        t;


    const y =
        branch.y1 +
        (
            branch.y2 -
            branch.y1
        ) *
        t;


    const dx =
        branch.x2 -
        branch.x1;


    const dy =
        branch.y2 -
        branch.y1;


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


    // Maximum generation = leaf

    if (
        branch.generation >=
        MAX_GENERATIONS
    ) {

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
            length *
            t *
            0.8
        );


    const newWidth =
        Math.max(
            4,
            branch.width * 0.55
        );


    // Left branch

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

        width:
            newWidth,

        generation:
            newGeneration,

        branched:
            false,

        hasLeaf:
            false
    });


    // Right branch

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

        width:
            newWidth,

        generation:
            newGeneration,

        branched:
            false,

        hasLeaf:
            false
    });
}


// ==================================================
// ADD LEAF
// ==================================================

function addLeaf(
    x,
    y,
    angle
) {

    leaves.push({

        x: x,

        y: y,

        angle: angle
    });
}


// ==================================================
// DISTANCE TO BRANCH
// ==================================================

function distanceToBranch(
    px,
    py,
    branch
) {

    const x1 =
        branch.x1;

    const y1 =
        branch.y1;

    const x2 =
        branch.x2;

    const y2 =
        branch.y2;


    const dx =
        x2 - x1;

    const dy =
        y2 - y1;


    const lengthSquared =
        dx * dx +
        dy * dy;


    if (
        lengthSquared === 0
    ) {

        return {

            distance:
                Math.hypot(
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


    t =
        Math.max(
            0,
            Math.min(
                1,
                t
            )
        );


    const closestX =
        x1 +
        t * dx;


    const closestY =
        y1 +
        t * dy;


    const distance =
        Math.hypot(
            px - closestX,
            py - closestY
        );


    return {

        distance:
            distance,

        t:
            t
    };
}


// ==================================================
// RESET
// ==================================================

document
    .getElementById("reset")
    .addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            zoom = 1;


            createStem();


            draw();
        }
    );


// ==================================================
// RESIZE
// ==================================================

let resizeTimer;


window.addEventListener(
    "resize",
    function() {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                resizeCanvas,
                50
            );
    }
);


// ==================================================
// MOBILE VIEWPORT
// ==================================================

if (window.visualViewport) {

    window.visualViewport.addEventListener(
        "resize",
        function() {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    resizeCanvas,
                    50
                );
        }
    );
}


// ==================================================
// START
// ==================================================

resizeCanvas();

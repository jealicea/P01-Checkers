/**
 * Checkers 3D using Three.js
 */

import { CheckersGame } from './CheckersGame.js';

let scene, camera, renderer, controls;
let game;
let boardSquares = [];
let pieces = [];
let raycaster, mouse;
let selectedSquareMaterial, validMoveMaterial;

function init() {
    game = new CheckersGame();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    selectedSquareMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    validMoveMaterial = new THREE.MeshLambertMaterial({ color: 0x0080ff, transparent: true, opacity: 0.3 });

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(8, 6, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 100);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    createSimpleTable();
    createCheckersBoard();
    createCheckersPieces();
    addLighting();

    renderer.domElement.addEventListener('click', onMouseClick, false);

    updateBoardHighlighting();
    animate();

    window.addEventListener('resize', onWindowResize, false);
}

function createSimpleTable() {
    const tableGroup = new THREE.Group();

    const tableTopGeometry = new THREE.BoxGeometry(8, 0.2, 8);
    const tableTopMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
    tableTop.position.y = 0;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    const legGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.2);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });

    // Front left leg
    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(-3.6, -0.75, 3.6);
    leg1.castShadow = true;
    tableGroup.add(leg1);

    // Front right leg
    const leg2 = new THREE.Mesh(legGeometry, legMaterial);
    leg2.position.set(3.6, -0.75, 3.6);
    leg2.castShadow = true;
    tableGroup.add(leg2);

    // Back left leg
    const leg3 = new THREE.Mesh(legGeometry, legMaterial);
    leg3.position.set(-3.6, -0.75, -3.6);
    leg3.castShadow = true;
    tableGroup.add(leg3);

    // Back right leg
    const leg4 = new THREE.Mesh(legGeometry, legMaterial);
    leg4.position.set(3.6, -0.75, -3.6);
    leg4.castShadow = true;
    tableGroup.add(leg4);
    
    scene.add(tableGroup);
    return tableGroup;
}

function createCheckersBoard() {
    const squareSize = 0.9;
    const boardSize = 8;
    const boardOffset = (boardSize - 1) * squareSize / 2;

    boardSquares = [];
    for (let row = 0; row < boardSize; row++) {
        boardSquares[row] = [];
    }

    const lightSquareMaterial = new THREE.MeshLambertMaterial({ color: 0xf0d9b5 });
    const darkSquareMaterial = new THREE.MeshLambertMaterial({ color: 0xb58863 });

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const isLightSquare = (row + col) % 2 === 0;
            
            const squareGeometry = new THREE.BoxGeometry(squareSize, 0.05, squareSize);
            const squareMaterial = isLightSquare ? lightSquareMaterial : darkSquareMaterial;
            const square = new THREE.Mesh(squareGeometry, squareMaterial);
            
            const x = (col * squareSize) - boardOffset;
            const z = (row * squareSize) - boardOffset;
            square.position.set(x, 0.125, z); // Slightly above table surface
            
            square.userData = { row, col, originalMaterial: squareMaterial };
            boardSquares[row][col] = square;
            
            square.castShadow = true;
            square.receiveShadow = true;
            scene.add(square);
        }
    }
}

function createCheckersPieces() {
    clearPieces();

    const squareSize = 0.9;
    const boardSize = 8;
    const boardOffset = (boardSize - 1) * squareSize / 2;
    const pieceRadius = 0.35;
    const pieceHeight = 0.1;

    pieces = [];
    for (let row = 0; row < boardSize; row++) {
        pieces[row] = [];
        for (let col = 0; col < boardSize; col++) {
            pieces[row][col] = null;
        }
    }

    const redPieceMaterial = new THREE.MeshLambertMaterial({ color: 0xdc3545 });
    const blackPieceMaterial = new THREE.MeshLambertMaterial({ color: 0x343a40 }); 
    const redKingMaterial = new THREE.MeshLambertMaterial({ color: 0xff6b7a }); 
    const blackKingMaterial = new THREE.MeshLambertMaterial({ color: 0x6c757d });

    const pieceGeometry = new THREE.CylinderGeometry(pieceRadius, pieceRadius, pieceHeight, 16);

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const gamepiece = game.board[row][col];
            if (gamepiece) {
                let material;
                if (gamepiece.isKing) {
                    material = gamepiece.color === 'red' ? redKingMaterial : blackKingMaterial;
                } else {
                    material = gamepiece.color === 'red' ? redPieceMaterial : blackPieceMaterial;
                }

                const piece = new THREE.Mesh(pieceGeometry, material);
                
                const x = (col * squareSize) - boardOffset;
                const z = (row * squareSize) - boardOffset;
                piece.position.set(x, 0.2, z); 
                
                piece.userData = { row, col, color: gamepiece.color, isKing: gamepiece.isKing };
                pieces[row][col] = piece;
                
                piece.castShadow = true;
                piece.receiveShadow = true;
                scene.add(piece);
            }
        }
    }
}

function addLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const spotlight = new THREE.SpotLight(0xffffff, 1.5);
    spotlight.position.set(0, 8, 0); // Position directly above the board
    spotlight.target.position.set(0, 0, 0);
    spotlight.angle = Math.PI / 4;
    spotlight.penumbra = 0.2;
    spotlight.decay = 2;
    spotlight.distance = 20;
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;
    spotlight.shadow.camera.near = 0.5;
    spotlight.shadow.camera.far = 20;
    spotlight.shadow.camera.fov = 45;
    scene.add(spotlight);
    scene.add(spotlight.target);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 100);
}

/**
 * Clear all pieces from the scene
 */
function clearPieces() {
    if (pieces) {
        for (let row = 0; row < pieces.length; row++) {
            for (let col = 0; col < pieces[row].length; col++) {
                if (pieces[row][col]) {
                    scene.remove(pieces[row][col]);
                    pieces[row][col] = null;
                }
            }
        }
    }
}

/**
 * Update board square highlighting based on game state
 */
function updateBoardHighlighting() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = boardSquares[row][col];
            if (square) {
                square.material = square.userData.originalMaterial;
            }
        }
    }

    // Highlight selected piece square
    if (game.selectedPiece) {
        const { row, col } = game.selectedPiece;
        const square = boardSquares[row][col];
        if (square) {
            square.material = selectedSquareMaterial;
        }
    }

    // Highlight valid move squares
    game.validMoves.forEach(move => {
        const square = boardSquares[move.row][move.col];
        if (square) {
            square.material = validMoveMaterial;
        }
    });
}

/**
 * Handle mouse clicks for piece selection and movement
 */
function onMouseClick(event) {
    event.preventDefault();

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        
        if (intersected.userData && typeof intersected.userData.row !== 'undefined') {
            const { row, col } = intersected.userData;
            handleSquareClick(row, col);
        }
    }
}

/**
 * Handle click on a board square - similar to checkers2d.js logic
 */
function handleSquareClick(row, col) {
    if (game.isGameOver) return;
    
    if (!game.selectPiece(row, col) && !game.makeMove(row, col)) {
        game.deselectPiece();
    }

    updateBoardHighlighting();
    updatePieces();
}

/**
 * Update pieces visual representation to match game state
 */
function updatePieces() {
    createCheckersPieces();
}

/**
 * Reset the game and visual representation
 */
function resetGame() {
    game.reset();
    createCheckersPieces();
    updateBoardHighlighting();
}
window.addEventListener('load', init);
document.getElementById('resetButton3D').addEventListener('click', function () {
    resetGame();
});

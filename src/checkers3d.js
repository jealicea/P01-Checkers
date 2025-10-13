/**
 * Checkers 3D using Three.js
 */

import { CheckersGame } from './CheckersGame.js';

let scene, camera, renderer, controls;
let overheadViewCamera, overheadViewRenderer;
let game;
let boardSquares = [];
let pieces = [];
let raycaster, mouse;
let selectedSquareMaterial, validMoveMaterial;
let isInitialized = false;

/**
 * Load the game and render the board
 */
window.addEventListener('load', () => {
    if (isInitialized) {
        return;
    }
    isInitialized = true;

    game = new CheckersGame();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    selectedSquareMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    validMoveMaterial = new THREE.MeshLambertMaterial({ color: 0x0080ff, transparent: true, opacity: 0.3 });

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 10);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 100);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    

    const existingCanvases = document.body.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => {
        if (canvas.parentNode === document.body) {
            document.body.removeChild(canvas);
        }
    });
    
    document.body.appendChild(renderer.domElement);

    renderOverheadView();

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2;

    createTable();
    createCheckersBoard();
    createCheckersPieces();
    addLighting();

    renderer.domElement.addEventListener('click', onMouseClick, false);

    updateBoardHighlighting();
    animate();

    window.addEventListener('resize', onWindowResize, false);

    /**
     * Reset the game
     */
    document.getElementById('resetButton3D').addEventListener('click', () => {
        game.reset();
        camera.position.set(0, 8, 10);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
        render3D();
    });

    /**
     * Render the 3D game board and pieces
     */
    function render3D() {
        createCheckersPieces();
        updateBoardHighlighting();
    }

    /**
     * Handle the click event on a board square.
     * @param {number} row the row of the cell
     * @param {number} col the column of the cell
     */
    function handleSquareClick(row, col) {
        if (game.isGameOver) { return; }
        if (!game.selectPiece(row, col) && !game.makeMove(row, col)) {
            game.deselectPiece();
        }
        render3D();
    }

    /**
     * Create a table for the checkers board
     * @returns {THREE.Group} the table group
     */
    function createTable() {
        const tableGroup = new THREE.Group();

        const tableTopGeometry = new THREE.BoxGeometry(14, 0.3, 14);
        const tableTopMaterial = new THREE.MeshLambertMaterial({ color: 0x784E31 });
        const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
        tableTop.position.y = 0;
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        tableGroup.add(tableTop);

        const legGeometry = new THREE.BoxGeometry(1.0, 2.0, 1.0);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });

        // Front left leg
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-6.3, -1.0, 6.3);
        leg1.castShadow = true;
        tableGroup.add(leg1);

        // Front right leg
        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(6.3, -1.0, 6.3);
        leg2.castShadow = true;
        tableGroup.add(leg2);

        // Back left leg
        const leg3 = new THREE.Mesh(legGeometry, legMaterial);
        leg3.position.set(-6.3, -1.0, -6.3);
        leg3.castShadow = true;
        tableGroup.add(leg3);

        // Back right leg
        const leg4 = new THREE.Mesh(legGeometry, legMaterial);
        leg4.position.set(6.3, -1.0, -6.3);
        leg4.castShadow = true;
        tableGroup.add(leg4);
        
        scene.add(tableGroup);
        return tableGroup;
    }

    function createCheckersBoard() {
        const squareSize = 1.3;
        const boardSize = 8;
        const boardOffset = (boardSize - 1) * squareSize / 2;

        boardSquares = [];
        for (let row = 0; row < boardSize; row++) {
            boardSquares[row] = [];
        }

        createBoardBorder(squareSize, boardSize, boardOffset);

        const lightSquareMaterial = new THREE.MeshLambertMaterial({ color: 0xf0d9b5 });
        const darkSquareMaterial = new THREE.MeshLambertMaterial({ color: 0xb58863 });

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const isLightSquare = (row + col) % 2 === 0;
                
                const squareGeometry = new THREE.BoxGeometry(squareSize, 0.08, squareSize);
                const squareMaterial = isLightSquare ? lightSquareMaterial : darkSquareMaterial;
                const square = new THREE.Mesh(squareGeometry, squareMaterial);
                
                const x = (col * squareSize) - boardOffset;
                const z = (row * squareSize) - boardOffset;
                square.position.set(x, 0.125, z);
                
                square.userData = { row, col, originalMaterial: squareMaterial };
                boardSquares[row][col] = square;
                
                square.castShadow = true;
                square.receiveShadow = true;
                scene.add(square);
            }
        }
    }

    /**
     * Create a border around the checkers board
     * @param {*} squareSize 
     * @param {*} boardSize 
     * @param {*} boardOffset 
     */
    function createBoardBorder(squareSize, boardSize, boardOffset) {
        const borderWidth = 0.2;
        const borderHeight = 0.12;
        const totalBoardSize = boardSize * squareSize;
        const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

        // Top border
        const topBorderGeometry = new THREE.BoxGeometry(totalBoardSize + borderWidth * 2, borderHeight, borderWidth);
        const topBorder = new THREE.Mesh(topBorderGeometry, borderMaterial);
        topBorder.position.set(0, 0.125, -boardOffset - squareSize/2 - borderWidth/2);
        topBorder.castShadow = true;
        topBorder.receiveShadow = true;
        scene.add(topBorder);

        // Bottom border
        const bottomBorderGeometry = new THREE.BoxGeometry(totalBoardSize + borderWidth * 2, borderHeight, borderWidth);
        const bottomBorder = new THREE.Mesh(bottomBorderGeometry, borderMaterial);
        bottomBorder.position.set(0, 0.125, boardOffset + squareSize/2 + borderWidth/2);
        bottomBorder.castShadow = true;
        bottomBorder.receiveShadow = true;
        scene.add(bottomBorder);

        // Left border
        const leftBorderGeometry = new THREE.BoxGeometry(borderWidth, borderHeight, totalBoardSize);
        const leftBorder = new THREE.Mesh(leftBorderGeometry, borderMaterial);
        leftBorder.position.set(-boardOffset - squareSize/2 - borderWidth/2, 0.125, 0);
        leftBorder.castShadow = true;
        leftBorder.receiveShadow = true;
        scene.add(leftBorder);

        // Right border
        const rightBorderGeometry = new THREE.BoxGeometry(borderWidth, borderHeight, totalBoardSize);
        const rightBorder = new THREE.Mesh(rightBorderGeometry, borderMaterial);
        rightBorder.position.set(boardOffset + squareSize/2 + borderWidth/2, 0.125, 0);
        rightBorder.castShadow = true;
        rightBorder.receiveShadow = true;
        scene.add(rightBorder);
    }

    /**
     * Create checkers pieces and add them to the scene
     */
    function createCheckersPieces() {
        clearPieces();

        const squareSize = 1.3;
        const boardSize = 8;
        const boardOffset = (boardSize - 1) * squareSize / 2;
        const pieceRadius = 0.5;
        const pieceHeight = 0.15;

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

    /**
     * Add lighting to the scene
     */
    function addLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const spotlight = new THREE.SpotLight(0xffffff, 1.5);
        spotlight.position.set(0, 12, 0); 
        spotlight.target.position.set(0, 0, 0);
        spotlight.angle = Math.PI / 3.5;
        spotlight.penumbra = 0.2;
        spotlight.decay = 2;
        spotlight.distance = 25;
        spotlight.castShadow = true;
        spotlight.shadow.mapSize.width = 2048;
        spotlight.shadow.mapSize.height = 2048;
        spotlight.shadow.camera.near = 0.5;
        spotlight.shadow.camera.far = 20;
        spotlight.shadow.camera.fov = 45;
        scene.add(spotlight);
        scene.add(spotlight.target);
    }

    /**
     * Render the overhead view of the board
     */
    function renderOverheadView() {
        // Create orthographic camera for top-down view
        const size = 5.5;
        overheadViewCamera = new THREE.OrthographicCamera(
            -size, size, size, -size, 0.1, 100
        );
        overheadViewCamera.position.set(0, 15, 0);
        overheadViewCamera.lookAt(0, 0, 0);

        overheadViewRenderer = new THREE.WebGLRenderer({ antialias: true });
        overheadViewRenderer.setSize(200, 200);
        overheadViewRenderer.shadowMap.enabled = true;
        overheadViewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const overheadViewContainer = document.getElementById('overheadView');
        
        while (overheadViewContainer.firstChild) {
            overheadViewContainer.removeChild(overheadViewContainer.firstChild);
        }
        
        overheadViewContainer.appendChild(overheadViewRenderer.domElement);
    }

    /**
     * Create the animation loop
     */
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        overheadViewRenderer.render(scene, overheadViewCamera);
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
});
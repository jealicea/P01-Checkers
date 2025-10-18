/**
 * Checkers 3D using Three.js
 */

import { CheckersGame } from './CheckersGame.js';

let scene
let camera
let renderer
let controls
let overheadViewCamera
let overheadViewRenderer
let game
let boardSquares = []
let pieces = []
let ghostPieces = []
let raycaster
let mouse
let selectedSquareMaterial
let validMoveMaterial
let selectedPiecePointLight
let tableGroup
let redPieceMaterial
let blackPieceMaterial
let redKingMaterial
let blackKingMaterial
let ghostMaterial

/**
 * Loads the game and renders the board
 */
window.addEventListener('load', () => {

    game = new CheckersGame();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    selectedSquareMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    validMoveMaterial = new THREE.MeshLambertMaterial({ color: 0x0080ff, transparent: true, opacity: 0.3 });

    redPieceMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0xdc3545,
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9
    });
    blackPieceMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0x343a40,
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9
    }); 
    redKingMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0xffd700, // Gold
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 1.0
    });
    blackKingMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0xc0c0c0, // Silver
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 1.0
    });
    ghostMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x66ff66,
        emissive: 0x003300,
        transparent: true, 
        opacity: 0.6,
        roughness: 0.3,
        metalness: 0.1
    });

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

    tableGroup = createTable();
    createCheckersBoard();
    createCheckersPieces();
    addLighting();

    renderer.domElement.addEventListener('click', onMouseClick, false);

    updateBoardHighlighting();
    switchCameraPerspective();
    animate();

    window.addEventListener('resize', onWindowResize, false);

    document.getElementById('resetButton3D').addEventListener('click', () => {
        game.reset();
        switchCameraPerspective();
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
        if (game.isGameOver) return;
        const previousPlayer = game.currentPlayer;
        if (!game.selectPiece(row, col) && !game.makeMove(row, col)) {
            game.deselectPiece();
        }
        if (previousPlayer !== game.currentPlayer) {
            switchCameraPerspective();
        }
        render3D();
    }

    /**
     * Switch camera perspective based on current player
     */
    function switchCameraPerspective() {
        if (game.currentPlayer === 'red') {
            camera.position.set(0, 8, 10);
        } else {
            camera.position.set(0, 8, -10);
        }
        controls.target.set(0, 0, 0);
        controls.update();
    }

    /**
     * Create a table for the checkers board
     * @returns {THREE.Group} the table group
     */
    function createTable() {
        tableGroup = new THREE.Group();

        // Create table top
        const tableTopGeometry = new THREE.BoxGeometry(14, 0.3, 14);
        const tableTopMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x6d4c2f,
            roughness: 0.4,
            metalness: 0.0,
            clearcoat: 0.6,
            clearcoatRoughness: 0.3,
            reflectivity: 0.3
        });
        const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
        tableTop.position.y = 0;
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        tableGroup.add(tableTop);

        // Create table legs
        const legGeometry = new THREE.BoxGeometry(1.0, 3.5, 1.0);
        const legMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x4a3022,
            roughness: 0.6,
            metalness: 0.0,
            clearcoat: 0.4,
            clearcoatRoughness: 0.5,
            reflectivity: 0.2
        });

        // Front left leg
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-6.3, -1.75, 6.3);
        leg1.castShadow = true;
        tableGroup.add(leg1);

        // Front right leg 
        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(6.3, -1.75, 6.3);
        leg2.castShadow = true;
        tableGroup.add(leg2);

        // Back left leg
        const leg3 = new THREE.Mesh(legGeometry, legMaterial);
        leg3.position.set(-6.3, -1.75, -6.3);
        leg3.castShadow = true;
        tableGroup.add(leg3);

        // Back right leg
        const leg4 = new THREE.Mesh(legGeometry, legMaterial);
        leg4.position.set(6.3, -1.75, -6.3);
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

        const lightSquareMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xf5e6d3,
            roughness: 0.6,
            metalness: 0.0,
            clearcoat: 0.2,
            clearcoatRoughness: 0.8,
            reflectivity: 0.1
        });
        
        const darkSquareMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x5d4037,
            roughness: 0.7,
            metalness: 0.0,
            clearcoat: 0.3,
            clearcoatRoughness: 0.6,
            reflectivity: 0.15
        });

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const isLightSquare = (row + col) % 2 === 0;
                const squareGeometry = new THREE.BoxGeometry(squareSize, 0.25, squareSize);
                const squareMaterial = isLightSquare ? lightSquareMaterial : darkSquareMaterial;
                const square = new THREE.Mesh(squareGeometry, squareMaterial);
                
                const x = (col * squareSize) - boardOffset;
                const z = (row * squareSize) - boardOffset;
                square.position.set(x, 0.275, z);
                
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
        const borderHeight = 0.3;
        const totalBoardSize = boardSize * squareSize;
        const borderMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x2e1e0f,
            roughness: 0.8,
            metalness: 0.0,
            clearcoat: 0.4,
            clearcoatRoughness: 0.7,
            reflectivity: 0.1
        });

        // Top border
        const topBorderGeometry = new THREE.BoxGeometry(totalBoardSize + borderWidth * 2, borderHeight, borderWidth);
        const topBorder = new THREE.Mesh(topBorderGeometry, borderMaterial);
        topBorder.position.set(0, 0.275, -boardOffset - squareSize/2 - borderWidth/2);
        topBorder.castShadow = true;
        topBorder.receiveShadow = true;
        scene.add(topBorder);

        // Bottom border
        const bottomBorderGeometry = new THREE.BoxGeometry(totalBoardSize + borderWidth * 2, borderHeight, borderWidth);
        const bottomBorder = new THREE.Mesh(bottomBorderGeometry, borderMaterial);
        bottomBorder.position.set(0, 0.275, boardOffset + squareSize/2 + borderWidth/2);
        bottomBorder.castShadow = true;
        bottomBorder.receiveShadow = true;
        scene.add(bottomBorder);

        // Left border
        const leftBorderGeometry = new THREE.BoxGeometry(borderWidth, borderHeight, totalBoardSize);
        const leftBorder = new THREE.Mesh(leftBorderGeometry, borderMaterial);
        leftBorder.position.set(-boardOffset - squareSize/2 - borderWidth/2, 0.275, 0);
        leftBorder.castShadow = true;
        leftBorder.receiveShadow = true;
        scene.add(leftBorder);

        // Right border
        const rightBorderGeometry = new THREE.BoxGeometry(borderWidth, borderHeight, totalBoardSize);
        const rightBorder = new THREE.Mesh(rightBorderGeometry, borderMaterial);
        rightBorder.position.set(boardOffset + squareSize/2 + borderWidth/2, 0.275, 0);
        rightBorder.castShadow = true;
        rightBorder.receiveShadow = true;
        scene.add(rightBorder);
    }

    /**
     * Create checkers pieces and add them to the scene
     * TODO: Use three cylinder geometries for pieces and crown SVG for kings
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

        const pieceGeometry = new THREE.CylinderGeometry(pieceRadius, pieceRadius, pieceHeight, 100);
        const innerCylinderGeometry = new THREE.CylinderGeometry(pieceRadius * 0.6, pieceRadius * 0.6, pieceHeight + 0.05, 16);
        const ringGeometry = new THREE.TorusGeometry(pieceRadius * 0.85, pieceRadius * 0.15, 16, 100);

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
                    const innerCylinder = new THREE.Mesh(innerCylinderGeometry, material);
                    innerCylinder.position.y = 0.1;
                    piece.add(innerCylinder);

                    const ring = new THREE.Mesh(ringGeometry, material);
                    ring.rotation.x = -Math.PI / 2;
                    ring.position.y = 0.1;
                    piece.add(ring);
                    
                    const x = (col * squareSize) - boardOffset;
                    const z = (row * squareSize) - boardOffset;
                    piece.position.set(x, 0.475, z); 
                    
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
     * Adds lighting to the scene
     * TODO: Improve lighting, fix the material bug, and add glow effects 
     * for selected pieces and valid move indicators.
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
     * Renders the overhead view of the board
     */
    function renderOverheadView() {
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
        overheadViewRenderer.domElement.addEventListener('click', onOverheadViewClick, false);
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
        if (selectedPiecePointLight) {
            scene.remove(selectedPiecePointLight);
            selectedPiecePointLight = null;
        }
        
        clearGhostPieces();
        
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
     * Clear all ghost pieces from the scene
     */
    function clearGhostPieces() {
        ghostPieces.forEach(ghostPiece => {
            if (ghostPiece) {
                if (ghostPiece.userData.ghostLight) {
                    scene.remove(ghostPiece.userData.ghostLight);
                }
                scene.remove(ghostPiece);
            }
        });
        ghostPieces = [];
    }

    /**
     * Create ghost pieces on valid move squares
     * TODO: Improve the ghost piece material so the board doesnt disappear under them.
     */
    function createGhostPieces() {
        clearGhostPieces();
        
        if (!game.selectedPiece || game.validMoves.length === 0) {
            return;
        }

        const { row: selectedRow, col: selectedCol } = game.selectedPiece;
        const selectedPiece = pieces[selectedRow][selectedCol];
        
        if (!selectedPiece) return;

        const squareSize = 1.3;
        const boardSize = 8;
        const boardOffset = (boardSize - 1) * squareSize / 2;
        const pieceRadius = 0.5;
        const pieceHeight = 0.15;
        
        const ghostGeometry = new THREE.CylinderGeometry(pieceRadius, pieceRadius, pieceHeight, 16);

        game.validMoves.forEach(move => {
            const ghostPiece = new THREE.Mesh(ghostGeometry, ghostMaterial);
            
            const x = (move.col * squareSize) - boardOffset;
            const z = (move.row * squareSize) - boardOffset;
            ghostPiece.position.set(x, 0.475, z);
            
            const ghostLight = new THREE.PointLight(0x00ff00, 0.8, 3, 2);
            ghostLight.position.set(x, 0.6, z);
            
            ghostPiece.userData = { 
                row: move.row, 
                col: move.col, 
                isGhost: true,
                ghostLight: ghostLight
            };
            
            ghostPieces.push(ghostPiece);
            scene.add(ghostPiece);
            scene.add(ghostLight);
        });
    }

    /**
     * Update board square highlighting based on game state
     */
    function updateBoardHighlighting() {
        if (selectedPiecePointLight) {
            scene.remove(selectedPiecePointLight);
            selectedPiecePointLight = null;
        }
        clearGhostPieces();

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = boardSquares[row][col];
                if (square) {
                    square.material = square.userData.originalMaterial;
                }
            }
        }

        if (game.selectedPiece) {
            const { row, col } = game.selectedPiece;
            const square = boardSquares[row][col];
            if (square) {
                square.material = selectedSquareMaterial;
            }
            
            const selectedPiece = pieces[row][col];
            if (selectedPiece) {
                selectedPiecePointLight = new THREE.PointLight(0xffffff, 0.8, 8, 2);
                selectedPiecePointLight.position.copy(selectedPiece.position);
                selectedPiecePointLight.position.y += 0.1;

                scene.add(selectedPiecePointLight);
            }
        }

        game.validMoves.forEach(move => {
            const square = boardSquares[move.row][move.col];
            if (square) {
                square.material = validMoveMaterial;
            }
        });

        createGhostPieces();
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
     * Handle mouse clicks on the overhead view for piece selection and movement
     */
    function onOverheadViewClick(event) {
        event.preventDefault();

        const rect = overheadViewRenderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, overheadViewCamera);

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
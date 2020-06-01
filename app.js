document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    let score = 0; // the current score
    const scoreDisplay = document.querySelector('#score');
    let stats = 0;
    const statsDisplay = document.querySelector('#stats');
    let levels = 0; // the level increases every ten lines you clear
    const levelsDisplay = document.querySelector('#levels');
    let lines = 0; // the number of cleared lines
    const linesDisplay = document.querySelector('#lines');
    const startButton = document.querySelector('#start-button');
    const width = 10;
    let nextRandom = 0;
    let timerId

    const colors  = [
        'magenta',
        'white',
        'lime',
        'cyan',
        'orange',
        'blue',
        'red'
    ]

    //The Tetrominoes
    const l1Tetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ]

    const iTetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ]

    const tTetromino = [
        [width, 1, width+1, width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2, width*2+1],
        [width, 1, width+1, width*2+1]
    ]

    const z1Tetromino = [
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1]
    ]

    const z2Tetromino = [
        [width, width+1, width*2+1, width*2+2],
        [2, width+1, width+2, width*2+1],
        [width, width+1, width*2+1, width*2+2],
        [2, width+1, width+2, width*2+1]
    ]

    const oTetromino = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ]

    const l2Tetromino = [
        [0, 1, width+1, width*2+1],
        [width, width+1, width+2, 2],
        [1, width+1, width*2+1, width*2+2],
        [width, width*2, width+1, width+2]
    ]



    const theTetrominoes = [l1Tetromino, l2Tetromino, z1Tetromino, z2Tetromino, tTetromino, oTetromino, iTetromino]
    let currentPosition = 4
    let currentRotation = 0

    //randomly select a Tetromino and it's first rotation
    let random = Math.floor(Math.random()*theTetrominoes.length)
    console.log(random);
    let current = theTetrominoes[random][currentRotation];

    //draw the Tetromino
    function draw() {
        current.forEach(index =>{
            squares[currentPosition + index].classList.add('tetromino')
            squares[currentPosition + index].style.backgroundColor = colors[random]
        })
    }

    //undraw the Tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    //make the Tetromino move down the screen every second
    //timerId = setInterval(moveDown, 1000)

    //assign functions on keyCodes
    function control(e) {
        if(e.keyCode === 55) {
            moveLeft()
        } else if (e.keyCode === 56) {
            rotate()
        } else if (e.keyCode === 57) {
            moveRight()
        } else if (e.keyCode == 54) {
            moveDown()
        }
    }
    document.addEventListener('keyup', control)

    //movedown function
    function moveDown() {
        undraw()
        currentPosition += width
        draw()
        freeze()
    }

    //freeze function
    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            //start a new Tetromino falling
            random = nextRandom
            nextRandom =  Math.floor(Math.random() * theTetrominoes.length)
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            draw()
            displayShape()
            addScore()
            addLevels()
            gameOver()
        }
    }

    //move the tetromino left, unless it is at the left edge or the index is taken
    function moveLeft () {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)   
        if(!isAtLeftEdge) currentPosition -=1
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition +=1
        }
        draw()
    }

    //move the tetromino right, unless it is at the right edge or the index is taken
    function moveRight () {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
        if(!isAtRightEdge) currentPosition +=1
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -=1
        }
        draw()
    }

    //rotate the tetromino
    function rotate() {
        undraw()
        currentRotation ++
        if(currentRotation === current.length) { //if the array limit has been reached proceed to 0
            currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        draw()
    }

    //show up-next tetromino in mini-grid display
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    const displayIndex = 0

    //the Tetraminoes without rotation
    const upNextTetrominoes = [
        [1, displayWidth+1, displayWidth*2+1, 2], //l1Tetromino
        [0, 1, displayWidth+1, displayWidth*2+1], //l2Tetromino
        [0, displayWidth, displayWidth+1, displayWidth*2+1], //z1Tetromino
        [displayWidth, displayWidth+1, displayWidth*2+1, displayWidth*2+2], //z2Tetromino
        [displayWidth, 1, displayWidth+1, displayWidth+2], //tTetromino
        [0, 1, displayWidth, displayWidth+1], //oTetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1], //iTetromino
    ]

    //display the shape in the mini-grid display
    function displayShape() {
        //remove any trace of a tetromino from the entire grid
        displaySquares.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''
        })
        upNextTetrominoes[nextRandom].forEach( index => {
            displaySquares[displayIndex + index].classList.add('tetromino')
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        })
        stats += 1;
        statsDisplay.innerHTML = stats;
    }

    //add functionality to the button
    startButton.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId)
            timerId = null
        } else {
            draw()
            timerId = setInterval(moveDown, 1000)
            nextRandom = Math.floor(Math.random()*theTetrominoes.length)
            displayShape()
        }
    })

    //add score
    function addScore(){
        for (let i = 0; i < 199; i += width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
            if(row.every(index => squares[index].classList.contains('taken'))) {
                score += 10
                scoreDisplay.innerHTML = score;
                lines += 1;
                linesDisplay.innerHTML = lines;
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    //add levels
    function addLevels() {
        if(lines +10) {
            levels += 1;
            levelsDisplay.innerHTML = levels;
        } 
    }

    //game over
    function gameOver() {
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        scoreDisplay.innerHTML = 'Game Over'
        clearInterval(timerId)
        }
    }
})
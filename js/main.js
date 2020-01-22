var gBoard;
var MINE = '💣'
var FLAG = '🚩'
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gInterval
var gFirstTimeClicked = 0
var gHint = false


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function initGame() {
    gBoard = createBoard()
    renderBoard(gBoard)
    gGame.isOn = true
}

function createBoard() {
    var board = []
    var size = gLevel.SIZE
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                i: i,
                j: j,
                hintShown: false
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[i].length; j++) {

            var currCell = board[i][j]
            var cellContent = ''
            if (currCell.isMarked === true) {
                cellContent = FLAG
                strHTML += `<td class="hidden"`
            } else {
                if (currCell.isShown === false) {
                    strHTML += `<td class="hidden"`
                } else {
                    if (currCell.isMine === false) {
                        strHTML += `<td class="safe"`
                        cellContent = currCell.minesAroundCount
                    } else {
                        strHTML += `<td class="bomb"`
                        cellContent = MINE
                    }
                }
            }
            strHTML += `onclick="cellClicked(${i}, ${j})" oncontextmenu="flagged(this, ${i}, ${j});  return false">
            ${cellContent}
            </td>`
        }
        strHTML += '</tr>'
    }
    var board = document.querySelector('.board')
    board.innerHTML = strHTML
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j]
            currCell.minesAroundCount = currCellNegs(i, j)
        }
    }
}

function currCellNegs(cellI, cellJ) {
    var count = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isMine === true) count++
        }
    }
    return count;
}

function flagged(elCell, i, j) {
    if (gGame.isOn === true) {
        var currCell = gBoard[i][j]
        currCell.isMarked = !currCell.isMarked
        renderBoard(gBoard)
        return false
    }
}

function cellClicked(i, j) {

    if (gGame.isOn === true) {
        if (gHint === true) {
            hintDisplay(i, j)
            setTimeout(hintDisplay.bind(null, i, j), 3000);

        } else {
            gFirstTimeClicked++
            if (gFirstTimeClicked === 1) {
                startTimer()
                randomMines(gLevel.MINES)
                setMinesNegsCount(gBoard)
            }
            var currCell = gBoard[i][j]
            if (currCell.isMine === true) {
                revelAll()
                gGame.isOn = false
                stopTimer()
            } else {
                currCell.isShown = true
            }
            currCell.hintShown = true

            renderBoard(gBoard)
        }
        isWin()
    }
}
/*
function isWin(params) {
    
}
*/

function isAllMinesMakred() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (cell.isMine === true && cell.isMarked !== true) {
                return false
            }
        }
    }
}

function revelAll() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currlCell = gBoard[i][j]
            currlCell.isShown = true
        }
    }
}

function randomMines(minesCount) {
    var counter = 0
    while (counter < minesCount) {
        var randomI = getRandomIntInclusive(0, gBoard.length - 1)
        var randomj = getRandomIntInclusive(0, gBoard[randomI].length - 1)

        gBoard[randomI][randomj].isMine = true
        counter++
    }
}

function restart() {
    initGame()
    resetTimer()
    stopTimer()
    gFirstTimeClicked = 0
}

function showHint(currHint) {
    gHint = true
    openModal()
    currHint.style.display = 'none'
}

function hintDisplay(cellI, cellJ) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (gBoard[i][j].hintShown === true) continue;
            gBoard[i][j].isShown = !gBoard[i][j].isShown
        }
    }
    renderBoard(gBoard)
    gHint = false
}

function openModal() {
    var modal = document.querySelector('.modal')
    modal.style.display = 'inline-block'
    setTimeout(hideModal, 3000)

}

function hideModal() {
    var modal = document.querySelector('.modal')
    modal.style.display = 'none'
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function difficulty(buttonPressed) {

    if (buttonPressed.innerText === 'easy') {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        restart()
    } else if (buttonPressed.innerText === 'medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 12
        restart()
    } else if (buttonPressed.innerText === 'hard') {
        gLevel.SIZE = 12
        gLevel.MINES = 30
        restart()
    }
}

function stopTimer() {
    clearInterval(gInterval)
}

function startTimer() {
    var startTime = new Date().getTime();
    gInterval = setInterval(timer, 2, startTime);
}

function timer(startTime) {
    var time = document.querySelector('.timer')
    var updateTime = new Date().getTime();
    var difference = updateTime - startTime;

    var seconds = difference / 1000
    time.innerText = seconds;
}

function resetTimer() {
    document.querySelector('.timer').innerText = '00:00:00'
    gFirstTimeClicked = 0
}

var gBoard;
var MINE = '💣'
var FLAG = '🚩'
var gInterval
var gFirstTimeClicked = 0
var gHint = false
var gLivesCount = 3
var glivesIdx = 0
var gTime = 0
var gSafeClickCount = 3


var gLevel = {
    SIZE: 4,
    MINES: 3
};
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
            strHTML += ` onclick="cellClicked(${i}, ${j})" oncontextmenu="flagged(${i}, ${j});  return false">
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
            var cellNegsCount = currCellNegs(i, j)
            currCell.minesAroundCount = cellNegsCount[1]
        }
    }
}

function currCellNegs(cellI, cellJ) {
    var count = 0
    var negs = []
    var negsAndCount = []

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            negs.push(gBoard[i][j])
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isMine === true) count++
        }
    }
    negsAndCount.push(negs)
    negsAndCount.push(count)
    return negsAndCount;
}

function flagged(i, j) {
    if (gGame.isOn === true) {
        var currCell = gBoard[i][j]
        currCell.isMarked = !currCell.isMarked
        renderBoard(gBoard)
        if (isWin()) {
            gGame.isOn = false
            var smiley = document.querySelector('.smiley')
            smiley.innerText = '😎'
            stopTimer()
            bestScore()
        }
        return false
    }
}

function cellClicked(i, j) {
    var currCell = gBoard[i][j]
    if (gGame.isOn === true) {
        if (gHint === true) {
            hintDisplay(i, j)
            setTimeout(hintDisplay.bind(null, i, j), 3000);
        } else {
            gFirstTimeClicked++
            if (gFirstTimeClicked === 1) {
                startTimer()
                randomMines(i, j, gLevel.MINES)
                if (currCell.isMine) {
                    currCell.isMine = false
                }
                setMinesNegsCount(gBoard)
            }
            if (currCell.minesAroundCount === 0) {
                var cellNegsCount = currCellNegs(i, j)
                currCell.minesAroundCount = cellNegsCount[1]
                openNegs(cellNegsCount[0])
            }
            if (currCell.isMine === true) {
                gLivesCount--
                removeLive()
                currCell.isShown = true
                if (gLivesCount === 0) {
                    var smiley = document.querySelector('.smiley')
                    smiley.innerText = '😵'
                    revelAll()
                    gGame.isOn = false
                    stopTimer()
                }
            } else {
                currCell.isShown = true
            }
            currCell.hintShown = true
            renderBoard(gBoard)
        }
        if (isWin() === true) {
            stopTimer()
            var smiley = document.querySelector('.smiley')
            smiley.innerHTML = '😎'
            bestScore()
        }
    }
}

function isWin() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if ((currCell.isMine === true && currCell.isMarked === false) ||
                (currCell.isMine === false && currCell.isShown === false)) {
                return false
            }
        }
    }
    return true
}

function openNegs(negs) {
    for (var i = 0; i < negs.length; i++) {
        negs[i].isShown = true
        negs[i].hintShown = true
    }
}

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

function randomMines(i, j, minesCount) {
    var counter = 0
    while (counter < minesCount) {
        var randomI = getRandomIntInclusive(0, gBoard.length - 1)
        var randomj = getRandomIntInclusive(0, gBoard[randomI].length - 1)
        if (randomI === i && randomj === j) continue;
        if (gBoard[randomI][randomj].isMine) continue
        gBoard[randomI][randomj].isMine = true
        counter++
    }
}

function restart() {
    initGame()
    resetTimer()
    stopTimer()
    restartHints()
    gLivesCount = 3
    resetLives()
    glivesIdx = 0
    gFirstTimeClicked = 0
    gSafeClickCount = 3
    var smiley = document.querySelector('.smiley')
    smiley.innerText = '🙂'
    var elSafeClick = document.querySelector('.safe-Button')
    elSafeClick.innerText = `you have ${gSafeClickCount} safe click left`
}

function showHint(currHint) {
    gHint = true
    openModal()
    currHint.style.display = 'none'
}

function restartHints() {
    var hints = document.querySelectorAll('.hint img')
    for (var i = 0; i < hints.length; i++) {
        hints[i].style.display = 'inline-block'
    }
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

function removeLive() {
    var lives = document.querySelectorAll('.lives p')
    lives[glivesIdx].style.display = 'none'
    glivesIdx++
}

function resetLives() {
    var lives = document.querySelectorAll('.lives p')
    for (var i = 0; i < gLivesCount; i++) {
        lives[i].style.display = 'inline-block'
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function difficulty(buttonPressed) {
    if (buttonPressed.innerText === 'easy') {
        gLevel.SIZE = 4
        gLevel.MINES = 3
        gLivesCount = 3
        restart()
    } else if (buttonPressed.innerText === 'medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 12
        gLivesCount = 3
        restart()
    } else if (buttonPressed.innerText === 'hard') {
        gLevel.SIZE = 12
        gLevel.MINES = 30
        gLivesCount = 3
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

    var seconds = difference
    time.innerText = msToTime(seconds)
    gTime = seconds
}

function msToTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;

    return + mins + ':' + secs + '.' + ms;
}

function resetTimer() {
    document.querySelector('.timer').innerText = '00:00:00'
    gFirstTimeClicked = 0
}

function bestScore() {
    if (gLevel.MINES === 3) {
        if (!(localStorage.getItem('easy'))) {
            localStorage.setItem('easy', gTime)
            document.querySelector('.best-time').innerText = 'best time:' + localStorage.getItem('easy');
        } else {
            if (gTime < localStorage.getItem('easy')) {
                localStorage.setItem('easy', gTime)
                document.querySelector('.best-time').innerText = 'best time:' + localStorage.getItem('easy');
                return;
            }
        }
    } else if (gLevel.MINES === 12) {
        if (!(localStorage.getItem('medium'))) {
            localStorage.setItem('medium', gTime)
            document.querySelector('.best-time').innerText = 'best time:' + localStorage.getItem('medium');
        } else {
            if (gTime < localStorage.getItem('medium')) {
                localStorage.setItem('medium', gTime)
                document.querySelector('.best-time').innerText = 'best time:' + localStorage.getItem('medium');
                return;
            }
        }
    } else if (gLevel.MINES === 30) {
        if (!(localStorage.getItem('hard'))) {
            localStorage.setItem('hard', gTime)
            document.querySelector('.best-time').innerText = 'best time:' + localStorage.getItem('hard');
        } else {
            if (gTime < localStorage.getItem('hard')) {
                localStorage.setItem('hard', gTime)
                document.querySelector('.best-time').innerText = 'best time:' + localStorage.getItem('hard');
                return;
            }
        }
    }
}

function safeClick() {
    if (gSafeClickCount > 0) {
        var randomI = getRandomIntInclusive(0, gBoard.length - 1)
        var randomj = getRandomIntInclusive(0, gBoard[randomI].length - 1)
        var cell = gBoard[randomI][randomj]
        if ((cell.isMine === false) && (cell.isShown === false)) {
            cell.isShown = true
            renderBoard(gBoard)
            var elSafeClick = document.querySelector('.safe-Button')
            elSafeClick.innerText = `you got ${gSafeClickCount - 1} click left`
            setTimeout(resetCellSafe.bind(null, randomI, randomj), 3000);
            gSafeClickCount--
        } else {
            safeClick()
        }
    }
    if (gSafeClickCount === 0) {
        var elSafeClick = document.querySelector('.safe-Button')
        elSafeClick.innerText = 'you have no safe click left'
    }
}
function resetCellSafe(i, j) {
    gBoard[i][j].isShown = false
    renderBoard(gBoard)
}

function changeLight() {
    var currColor = document.querySelector('body').style.backgroundColor
    if (currColor === 'black') {
        document.querySelector('body').style.backgroundColor = 'lightgray'
    } else {
        document.querySelector('body').style.backgroundColor = 'black'
    }
}
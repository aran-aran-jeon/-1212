// 게임 상태
const GameState = {
    START: 'start',
    PLAYING: 'playing',
    WIN: 'win',
    LOSE: 'lose'
};

// 게임 데이터
let gameState = GameState.START;
let player = {
    hp: 100,
    combo: 0
};
let monster = {
    hp: 100
};
let currentProblem = null;

// DOM 요소
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const problemText = document.getElementById('problem-text');
const comboDisplay = document.getElementById('combo-display');
const resultLog = document.getElementById('result-log');
const playerHp = document.getElementById('player-hp');
const playerHpBar = document.getElementById('player-hp-bar');
const monsterHp = document.getElementById('monster-hp');
const monsterHpBar = document.getElementById('monster-hp-bar');
const monsterImage = document.getElementById('monster-image');
const monsterPlaceholder = document.querySelector('.monster-placeholder');
const monsterFace = document.querySelector('.monster-face');
const magicEffectContainer = document.getElementById('magic-effect-container');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');

// 랜덤 숫자 생성 함수
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 문제 생성
function generateProblem() {
    const a = random(2, 9);
    const b = random(1, 9);
    return {
        a: a,
        b: b,
        answer: a * b
    };
}

// 정답 판정
function checkAnswer(input, problem) {
    return parseInt(input) === problem.answer;
}

// 공격 처리
function attack(target, damage) {
    target.hp = Math.max(0, target.hp - damage);
}

// 콤보 기반 데미지 계산
function calcDamage(combo) {
    return 10 + combo * 2;
}

// HP 바 업데이트
function updateHPBar(element, hpValue, barElement) {
    element.textContent = hpValue;
    const percentage = (hpValue / 100) * 100;
    barElement.style.width = percentage + '%';
}

// 콤보 표시 업데이트
function updateComboDisplay(combo) {
    if (combo > 0) {
        comboDisplay.textContent = `COMBO x${combo}${combo >= 5 ? '!' : ''}`;
        comboDisplay.classList.add('active');
    } else {
        comboDisplay.textContent = '';
        comboDisplay.classList.remove('active');
    }
}

// 마법 공격 이펙트 생성
function createMagicAttack(damage) {
    if (!magicEffectContainer) return;
    
    // 플레이어 영역과 몬스터 영역의 위치 계산
    const playerArea = document.querySelector('.player-area');
    const monsterArea = document.querySelector('.monster-area');
    
    if (!playerArea || !monsterArea) return;
    
    const playerRect = playerArea.getBoundingClientRect();
    const monsterRect = monsterArea.getBoundingClientRect();
    const containerRect = document.querySelector('.game-container').getBoundingClientRect();
    
    // 시작 위치 (플레이어 영역 중앙)
    const startX = playerRect.left + playerRect.width / 2 - containerRect.left;
    const startY = playerRect.top + playerRect.height / 2 - containerRect.top;
    
    // 목표 위치 (몬스터 영역 중앙)
    const targetX = monsterRect.left + monsterRect.width / 2 - containerRect.left;
    const targetY = monsterRect.top + monsterRect.height / 2 - containerRect.top;
    
    // 데미지에 따른 하트 개수 결정 (데미지 10당 1개, 최소 1개)
    const heartCount = Math.max(1, Math.ceil(damage / 10));
    
    // 빨강/핑크 색상 배열
    const colors = ['#ff1744', '#e91e63', '#ff4081', '#f50057', '#c2185b', '#ff1493', '#ff69b4'];
    
    // 하트 생성
    for (let i = 0; i < heartCount; i++) {
        // 약간씩 다른 시작 위치 (산개 효과)
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        const offsetTargetX = (Math.random() - 0.5) * 30;
        const offsetTargetY = (Math.random() - 0.5) * 30;
        
        // 이동 거리 계산
        const deltaX = (targetX + offsetTargetX) - (startX + offsetX);
        const deltaY = (targetY + offsetTargetY) - (startY + offsetY);
        
        // 랜덤 색상 선택
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 하트 생성
        const magicOrb = document.createElement('div');
        magicOrb.className = 'magic-orb';
        magicOrb.style.left = (startX + offsetX) + 'px';
        magicOrb.style.top = (startY + offsetY) + 'px';
        magicOrb.style.color = randomColor;
        magicOrb.style.setProperty('--target-x', deltaX + 'px');
        magicOrb.style.setProperty('--target-y', deltaY + 'px');
        
        // 약간씩 다른 타이밍으로 발사
        const delay = i * 50;
        
        setTimeout(() => {
            magicEffectContainer.appendChild(magicOrb);
            
            // 정리
            setTimeout(() => {
                magicOrb.remove();
            }, 600);
        }, delay);
    }
    
    // 폭발 효과 (몬스터 위치에서, 마지막 하트 도착 후)
    setTimeout(() => {
        const explosion = document.createElement('div');
        explosion.className = 'magic-explosion';
        explosion.style.left = targetX + 'px';
        explosion.style.top = targetY + 'px';
        // 폭발 색상도 랜덤
        const explosionColor = colors[Math.floor(Math.random() * colors.length)];
        explosion.style.background = `radial-gradient(circle, ${explosionColor}80, transparent)`;
        explosion.style.boxShadow = `0 0 30px ${explosionColor}, 0 0 60px ${explosionColor}`;
        magicEffectContainer.appendChild(explosion);
        
        setTimeout(() => {
            explosion.remove();
        }, 500);
    }, 600 + (heartCount - 1) * 50);
}

// 화면 전환
function switchScreen(state) {
    startScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.remove('active');

    switch (state) {
        case GameState.START:
            startScreen.classList.add('active');
            break;
        case GameState.PLAYING:
            gameScreen.classList.add('active');
            answerInput.focus();
            break;
        case GameState.WIN:
        case GameState.LOSE:
            resultScreen.classList.add('active');
            if (state === GameState.WIN) {
                resultTitle.textContent = '승리!';
                resultTitle.className = 'win';
                resultMessage.textContent = '축하합니다! 동글머리대마왕을 물리쳤습니다!';
            } else {
                resultTitle.textContent = '패배...';
                resultTitle.className = 'lose';
                resultMessage.textContent = '동글머리대마왕에게 패배했습니다. 다시 도전해보세요!';
            }
            break;
    }
    gameState = state;
}

// 게임 초기화
function initGame() {
    player.hp = 100;
    player.combo = 0;
    monster.hp = 100;
    
    updateHPBar(playerHp, player.hp, playerHpBar);
    updateHPBar(monsterHp, monster.hp, monsterHpBar);
    updateComboDisplay(0);
    resultLog.textContent = '';
    resultLog.className = 'result-log';
    
    currentProblem = generateProblem();
    problemText.textContent = `${currentProblem.a} × ${currentProblem.b} = ?`;
    answerInput.value = '';
    
    switchScreen(GameState.PLAYING);
}

// 승패 체크
function checkGameEnd() {
    if (monster.hp <= 0) {
        switchScreen(GameState.WIN);
        return true;
    }
    if (player.hp <= 0) {
        switchScreen(GameState.LOSE);
        return true;
    }
    return false;
}

// 턴 처리
function processTurn() {
    const userAnswer = answerInput.value.trim();
    
    if (!userAnswer) {
        return;
    }
    
    const isCorrect = checkAnswer(userAnswer, currentProblem);
    
    if (isCorrect) {
        // 정답 처리
        player.combo += 1;
        const damage = calcDamage(player.combo);
        attack(monster, damage);
        
        updateHPBar(monsterHp, monster.hp, monsterHpBar);
        updateComboDisplay(player.combo);
        
        // 마법 공격 이펙트 (데미지 전달)
        createMagicAttack(damage);
        
        // 몬스터 공격 애니메이션 (마법 구체가 도착한 후)
        setTimeout(() => {
            const monsterElement = monsterImage && monsterImage.style.display !== 'none' 
                ? monsterImage 
                : (monsterFace || null);
            
            if (monsterElement) {
                monsterElement.classList.remove('hit');
                setTimeout(() => {
                    monsterElement.classList.add('hit');
                }, 10);
                setTimeout(() => {
                    monsterElement.classList.remove('hit');
                }, 500);
            }
        }, 600);
        
        resultLog.textContent = `정답! 동글머리대마왕에게 ${damage} 데미지!`;
        resultLog.className = 'result-log correct';
        
        // 승리 체크
        if (checkGameEnd()) {
            return;
        }
    } else {
        // 오답 처리
        player.combo = 0;
        attack(player, 10);
        
        updateHPBar(playerHp, player.hp, playerHpBar);
        updateComboDisplay(0);
        
        resultLog.textContent = `오답... 플레이어가 10 데미지를 받았다.`;
        resultLog.className = 'result-log incorrect';
        
        // 패배 체크
        if (checkGameEnd()) {
            return;
        }
    }
    
    // 다음 문제 생성
    currentProblem = generateProblem();
    problemText.textContent = `${currentProblem.a} × ${currentProblem.b} = ?`;
    answerInput.value = '';
    answerInput.focus();
}

// 이벤트 리스너
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', () => {
    switchScreen(GameState.START);
});

submitBtn.addEventListener('click', processTurn);

answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && gameState === GameState.PLAYING) {
        processTurn();
    }
});

// 게임 시작 시 시작 화면 표시
switchScreen(GameState.START);


class State extends Phaser.State {

    paddle: Phaser.Sprite
    ball: Phaser.Sprite
    bricks: Phaser.Group

    score: number = 0
    level: number = 1
    lives: number = 3
    scoreText: Phaser.Text
    levelText: Phaser.Text
    livesText: Phaser.Text
    gameText: Phaser.Text;
    music: Phaser.Sound;
    hit: Phaser.Sound;

    gameStarted: boolean = false

        preload() {

        //loading sprite assets
        this.load.image('paddle', 'assets/paddle.png')
        this.load.image('ball', 'assets/spikeball.png')
        this.load.image('brick_1', 'assets/red.png')
        this.load.image('brick_2', 'assets/blue.png')
        this.load.image('brick_3', 'assets/yellow.png')
        this.load.image('brick_4', 'assets/green.png')
        this.load.image('tile', 'assets/tile.png')

        //Audio assets bonus feature :)
        //this.load.audio('music', 'assets/audio/music.wav');
        this.load.audio('hit', 'assets/audio/hit.wav');

        //Scale & fit to screen 
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        this.scale.minWidth = window.innerWidth
        this.scale.maxWidth = window.innerWidth
        this.scale.minHeight = window.innerHeight
        this.scale.maxHeight = window.innerHeight

    }

    create() {

        this.physics.startSystem(Phaser.Physics.ARCADE)
        this.physics.arcade.checkCollision.down = false
        this.game.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'tile')
        this.music = this.add.audio('music');
        this.hit = this.add.audio('hit');

        this.music.play();


        this.paddle = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 250, 'paddle');
        this.paddle.anchor.setTo(0.5, 0.5)
        this.physics.enable(this.paddle, Phaser.Physics.ARCADE)
        this.paddle.body.collideWorldBounds = true
        this.paddle.body.immovable = true


        this.ball = this.add.sprite(this.world.centerX, this.paddle.y - 16, 'ball')

        this.ball.anchor.set(0.5, 0.5)
        this.physics.enable(this.ball, Phaser.Physics.ARCADE)
        this.ball.body.collideWorldBounds = true
        this.ball.checkWorldBounds = true
        this.ball.body.bounce.set(1)
        //Creating a signal when ball hits world bounds
        this.ball.body.onWorldBounds = new Phaser.Signal();
        //  listener for world bound signal
        this.ball.body.onWorldBounds.add(this.hitWorldBounds, this);

        this.bricks = this.add.group()
        this.bricks.physicsBodyType = Phaser.Physics.ARCADE
        this.bricks.enableBody = true

        // Generate all the brick sprites
        let brick: Phaser.Sprite
        this.ball.events.onOutOfBounds.add(this.ballLost, this);

        //brick array
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 16; x++) {
                //brick array positioning and alignment
                brick = this.bricks.create((this.game.world.centerX - 440) + (x * 56), 100 + (y * 52), 'brick_' + (y + 1))
                brick.body.bounce.set(1)
                brick.body.immovable = true
            }
        }
        //start the game when pressed
        this.input.onDown.add(this.startGame, this)

        this.levelText = this.game.add.text(32, 40, 'LEVEL: 1', { font: "20px Arial", fill: "#808080", align: "left" })
        this.scoreText = this.game.add.text(400, 40, 'SCORE: 0', { font: "20px Arial", fill: "#808080", align: "left" })
        this.livesText = this.game.add.text(850, 40, 'LIFE: 3', { font: "20px Arial", fill: "#808080", align: "left" })
        this.gameText = this.game.add.text(350, 350, 'PRESS TO START', { font: "40px Arial", fill: "#808080", align: "center" })

    }

    update()
    {   //initiate gameplay
        if (this.gameStarted) {
            this.paddle.x = this.input.x
            this.gameText.text = ''

            this.physics.arcade.collide(this.ball, this.paddle, this.paddleHit, null, this)
            this.physics.arcade.collide(this.ball, this.bricks, this.brickHit, null, this)
            this.paddle.x = this.game.input.x;

        }
        else {
            // Paddle set to the middle when serving
            this.paddle.x = this.game.world.centerX
        }


    }
    //Move the ball when game starts
    startGame() {

        if (!this.gameStarted) {
            this.resetBall()

            this.gameStarted = true

            this.ball.body.velocity.y = -500
            this.ball.body.velocity.x = -100
        }
    }

    
    paddleHit(ball, paddle) {
        var diff = 0
        this.hit.play();

        if (this.ball.x < this.paddle.x) {
            //  Ball is on the left-hand side of the paddle
            diff = this.paddle.x - this.ball.x
            this.ball.body.velocity.x = (-10 * diff)
        }
        else if (this.ball.x > this.paddle.x) {
            //  Ball is on the right-hand side of the paddle
            diff = this.ball.x - this.paddle.x
            this.ball.body.velocity.x = (10 * diff)
        }
        else {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            this.ball.body.velocity.x = 2 + Math.random() * 8
        }

    }
    //check if the ball hits game boundry
    hitWorldBounds() {
        this.hit.play();

    }
    // Called when ball and brick collide
    brickHit(ball, brick) {
        brick.kill();
        this.hit.play();

        this.score += 1;
        this.scoreText.text = 'SCORE: ' + this.score;

        if (this.bricks.countLiving() === 0) {

            this.bricks.callAll('revive', null)
            this.levelIncrement
        }
    }
    //if the ball fell
    ballLost() {

        this.lives--
        this.livesText.text = 'LIFE: ' + this.lives;

        if (this.lives === 0) {
            this.gameOver()
        }
        else {
            this.resetBall()
        }
    }

    //reset the ball to starting point
    resetBall() {
        this.gameStarted = false
        this.ball.body.velocity.set(0)
        this.ball.x = this.game.world.centerX
        this.ball.y = this.paddle.y - 20
        
    }

   //end game
    gameOver() {
        this.lives = 3
        this.score = 0
        this.score = 1
        this.scoreText.text = 'SCORE: 0';
        this.livesText.text = 'LIFE: ' + this.lives
        this.gameText.text = 'GAME OVER'

        this.bricks.callAll('revive', null)
        this.gameStarted = false
        this.resetBall()
    }

    //Game level up
    levelIncrement() {
        this.level += 1
        this.levelText.text = 'LEVEL: ' + this.level;
        this.ball.body.velocity.x += 50
        this.ball.body.velocity.y += 50
        this.life() 
    }

    //Check for lives
    life() {
        if (this.lives < 3)
            this.lives += 1
        this.livesText.text = 'LIFE: ' + this.lives

    }

}


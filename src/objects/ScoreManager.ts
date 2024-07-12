class ScoreManager {
    private static instance: ScoreManager
    private currentScore = 0
    private targetScore = 1000
    public eventEmitter: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter()

    private constructor() {}

    public static getInstance(): ScoreManager {
        if (!ScoreManager.instance) {
            ScoreManager.instance = new ScoreManager()
        }
        return ScoreManager.instance
    }

    public incrementScore(score: number): void {
        this.currentScore += score
        this.isTargetScoreReached() && this.eventEmitter.emit('reachTargetScore')
    }

    public getCurrentScore(): number {
        return this.currentScore
    }

    public isTargetScoreReached(): boolean {
        return this.currentScore >= this.targetScore
    }

    public resetScore(): void {
        this.currentScore = 0
    }

    public getTargetScore(): number {
        return this.targetScore
    }

    public setTargetScore(targetScore: number): void {
        this.targetScore = targetScore
    }

    public getProgressRatio(): number {
        return this.currentScore / this.targetScore
    }
}

export default ScoreManager

import CONST from '../const/const'
import Tile from '../objects/Tile'

class TweenHelper {
    static fadeIn(
        scene: Phaser.Scene,
        target: Phaser.GameObjects.GameObject,
        duration = 500,
        easing: string,
        callBack?: Function | undefined
    ) {
        return scene.tweens.add({
            targets: target,
            alpha: 1,
            duration: duration,
            ease: easing,
            onComplete: () => {
                if (callBack) callBack()
            },
        })
    }

    static fadeOutAndZoomIn(
        scene: Phaser.Scene,
        target: Phaser.GameObjects.GameObject | undefined,
        duration = 100,
        easing: string,
        tile: Tile,
        callBack?: Function | undefined
    ) {
        const centerX = tile?.x
        const centerY = tile?.y
        const newX = centerX + (CONST.tileWidth * 0.5) / 2
        const newY = centerY + (CONST.tileHeight * 0.5) / 2

        return scene.tweens.add({
            targets: target,
            alpha: 0,
            x: newX,
            y: newY,
            scale: 0.5,
            duration: duration,
            ease: easing,
            onComplete: () => {
                if (callBack) callBack()
            },
        })
    }

    static moveTo(
        scene: Phaser.Scene,
        target: Phaser.GameObjects.GameObject | undefined,
        x: number,
        y: number,
        duration = 200,
        easing: string,
        callBack?: Function | undefined,
        callBackUpdate?: Function | undefined
    ) {
        return scene.tweens.add({
            targets: target,
            x: x,
            y: y,
            duration: duration,
            ease: easing,
            onComplete: () => {
                if (callBack) callBack()
            },
            onUpdate: () => {
                if (callBackUpdate) callBackUpdate()
            },
        })
    }

    static clickToScale(
        scene: Phaser.Scene,
        target: Phaser.GameObjects.GameObject,
        x: number,
        y: number,
        scaleX: number,
        scaleY: number,
        duration = 500,
        easing: string,
        yoyo = false,
        callBack?: Function | undefined,
        callBackUpdate?: Function | undefined
    ) {
        return scene.tweens.add({
            targets: target,
            x: x,
            y: y,
            scaleX: scaleX,
            scaleY: scaleY,
            duration: duration,
            ease: easing,
            yoyo: yoyo,
            onComplete: () => {
                if (callBack) callBack()
            },
            onUpdate: () => {
                if (callBackUpdate) callBackUpdate()
            },
        })
    }

    static shuffleCircle(
        scene: Phaser.Scene,
        target: Phaser.Geom.Circle,
        radius: number,
        easing: string,
        duration = 1500,
        yoyo = true,
        repeat = 0,
        callBack?: Function | undefined,
        callBackComplete?: Function | undefined
    ) {
        return scene.tweens.add({
            targets: target,
            radius: radius,
            ease: easing,
            duration: duration,
            yoyo: yoyo,
            repeat: repeat,
            onUpdate: () => {
                if (callBack) {
                    callBack()
                }
            },
            onComplete: () => {
                if (callBackComplete) {
                    callBackComplete()
                }
            },
        })
    }

    static shuffleEllipse(
        scene: Phaser.Scene,
        ellipse: Phaser.Geom.Ellipse,
        targetWidth: number,
        targetHeight: number,
        easing: string,
        duration: number,
        yoyo: boolean,
        repeat: number,
        callBack?: Function | undefined,
        callBackComplete?: Function | undefined
    ) {
        return scene.tweens.add({
            targets: ellipse,
            props: {
                width: { value: targetWidth, ease: easing },
                height: { value: targetHeight, ease: easing },
            },
            duration: duration,
            yoyo: yoyo,
            repeat: repeat,
            onUpdate: () => {
                if (callBack) {
                    callBack()
                }
            },
            onComplete: () => {
                if (callBackComplete) {
                    callBackComplete()
                }
            },
        })
    }
}

export default TweenHelper

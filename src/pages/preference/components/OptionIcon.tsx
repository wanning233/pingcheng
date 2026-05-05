// src/pages/preference/components/OptionIcon.tsx
import { View, Text } from '@tarojs/components'
import styles from './OptionIcon.module.scss'

interface Props {
  icon: string
  active: boolean
}

export default function OptionIcon({ icon, active }: Props) {
  const e = active ? styles.elActive : styles.el

  // ── 口味 ──
  if (icon === 'chili') return (
    <View className={styles.wrap}>
      <View className={`${styles.chiliBody} ${e}`} />
      <View className={`${styles.chiliTip} ${e}`} />
      <View className={`${styles.chiliStem} ${e}`} />
    </View>
  )

  if (icon === 'smile') return (
    <View className={styles.wrap}>
      <View className={`${styles.smileFace} ${e}`}>
        <View className={`${styles.smileEye} ${e}`} />
        <View className={`${styles.smileEye} ${e}`} />
        <View className={`${styles.smileMouth} ${e}`} />
      </View>
    </View>
  )

  if (icon === 'no') return (
    <View className={styles.wrap}>
      <View className={`${styles.noCircle} ${e}`} />
      <View className={`${styles.noLine} ${e}`} />
    </View>
  )

  if (icon === 'peace') return (
    <View className={styles.wrap}>
      <View className={`${styles.peaceHand} ${e}`}>
        <View className={`${styles.peaceFinger1} ${e}`} />
        <View className={`${styles.peaceFinger2} ${e}`} />
        <View className={`${styles.peaceFinger3} ${e}`} />
      </View>
    </View>
  )

  // ── 预算 ──
  if (icon === 'budget-low') return (
    <View className={styles.wrap}>
      <View className={`${styles.coinStack} ${e}`}>
        <View className={`${styles.coin} ${e}`}><Text className={`${styles.coinText} ${active ? styles.coinTextActive : ''}`}>¥</Text></View>
      </View>
    </View>
  )

  if (icon === 'budget-mid') return (
    <View className={styles.wrap}>
      <View className={`${styles.coinStack} ${e}`}>
        <View className={`${styles.coin} ${e}`}><Text className={`${styles.coinText} ${active ? styles.coinTextActive : ''}`}>¥</Text></View>
        <View className={`${styles.coinShadow} ${e}`} />
      </View>
    </View>
  )

  if (icon === 'budget-high') return (
    <View className={styles.wrap}>
      <View className={`${styles.coinStack} ${e}`}>
        <View className={`${styles.coin} ${e}`}><Text className={`${styles.coinText} ${active ? styles.coinTextActive : ''}`}>¥</Text></View>
        <View className={`${styles.coinShadow} ${e}`} />
        <View className={`${styles.coinShadow2} ${e}`} />
      </View>
    </View>
  )

  if (icon === 'budget-any') return (
    <View className={styles.wrap}>
      <View className={`${styles.infinityWrap} ${e}`}>
        <View className={`${styles.infinityLeft} ${e}`} />
        <View className={`${styles.infinityRight} ${e}`} />
      </View>
    </View>
  )

  // ── 体力 ──
  if (icon === 'energy-high') return (
    <View className={styles.wrap}>
      <View className={`${styles.boltBody} ${e}`} />
    </View>
  )

  if (icon === 'energy-mid') return (
    <View className={styles.wrap}>
      <View className={`${styles.walkHead} ${e}`} />
      <View className={`${styles.walkBody} ${e}`} />
      <View className={`${styles.walkLeg1} ${e}`} />
      <View className={`${styles.walkLeg2} ${e}`} />
    </View>
  )

  if (icon === 'energy-low') return (
    <View className={styles.wrap}>
      <View className={`${styles.chairSeat} ${e}`} />
      <View className={`${styles.chairBack} ${e}`} />
      <View className={`${styles.chairLeg1} ${e}`} />
      <View className={`${styles.chairLeg2} ${e}`} />
    </View>
  )

  if (icon === 'energy-knee') return (
    <View className={styles.wrap}>
      <View className={`${styles.kneeUpper} ${e}`} />
      <View className={`${styles.kneeCap} ${e}`} />
      <View className={`${styles.kneeLower} ${e}`} />
    </View>
  )

  // ── 氛围 ──
  if (icon === 'vibe-photo') return (
    <View className={styles.wrap}>
      <View className={`${styles.camBody} ${e}`} />
      <View className={`${styles.camLens} ${e}`} />
      <View className={`${styles.camBump} ${e}`} />
    </View>
  )

  if (icon === 'vibe-eat') return (
    <View className={styles.wrap}>
      <View className={`${styles.bowlBase} ${e}`} />
      <View className={`${styles.bowlTop} ${e}`} />
      <View className={`${styles.chopstick1} ${e}`} />
      <View className={`${styles.chopstick2} ${e}`} />
    </View>
  )

  if (icon === 'vibe-chill') return (
    <View className={styles.wrap}>
      <View className={`${styles.cloudBody} ${e}`} />
      <View className={`${styles.cloudBump1} ${e}`} />
      <View className={`${styles.cloudBump2} ${e}`} />
    </View>
  )

  if (icon === 'vibe-explore') return (
    <View className={styles.wrap}>
      <View className={`${styles.mapFold} ${e}`} />
      <View className={`${styles.mapLine1} ${e}`} />
      <View className={`${styles.mapLine2} ${e}`} />
    </View>
  )

  // ── 出行时间 ──
  if (icon === 'early') return (
    <View className={styles.wrap}>
      <View className={`${styles.sunArc} ${e}`} />
      <View className={`${styles.sunRay1} ${e}`} />
      <View className={`${styles.sunRay2} ${e}`} />
      <View className={`${styles.sunRay3} ${e}`} />
      <View className={`${styles.sunRay4} ${e}`} />
      <View className={`${styles.sunRay5} ${e}`} />
    </View>
  )

  if (icon === 'normal-time') return (
    <View className={styles.wrap}>
      <View className={`${styles.clockFace} ${e}`}>
        <View className={`${styles.clockHour} ${e}`} />
        <View className={`${styles.clockMinute} ${e}`} />
      </View>
    </View>
  )

  if (icon === 'late') return (
    <View className={styles.wrap}>
      <View className={`${styles.moonOuter} ${e}`} />
      <View className={styles.moonMask} />
    </View>
  )

  if (icon === 'flex') return (
    <View className={styles.wrap}>
      <View className={`${styles.waveLine} ${e}`} />
      <View className={`${styles.waveLine2} ${e}`} />
    </View>
  )

  // ── 购物偏好 ──
  if (icon === 'no-shop') return (
    <View className={styles.wrap}>
      <View className={`${styles.bagBody} ${e}`} />
      <View className={`${styles.bagHandle} ${e}`} />
      <View className={`${styles.bagSlash} ${e}`} />
    </View>
  )

  if (icon === 'browse') return (
    <View className={styles.wrap}>
      <View className={`${styles.eyeOuter} ${e}`} />
      <View className={`${styles.eyePupil} ${e}`} />
    </View>
  )

  if (icon === 'walk-shop') return (
    <View className={styles.wrap}>
      <View className={`${styles.bagBody} ${e}`} />
      <View className={`${styles.bagHandle} ${e}`} />
    </View>
  )

  if (icon === 'shop-hard') return (
    <View className={styles.wrap}>
      <View className={`${styles.bagBody} ${e}`} />
      <View className={`${styles.bagHandle} ${e}`} />
      <View className={`${styles.starDot1} ${e}`} />
      <View className={`${styles.starDot2} ${e}`} />
      <View className={`${styles.starDot3} ${e}`} />
    </View>
  )

  // ── 饮食限制 ──
  if (icon === 'no-limit') return (
    <View className={styles.wrap}>
      <View className={`${styles.checkShort} ${e}`} />
      <View className={`${styles.checkLong} ${e}`} />
    </View>
  )

  if (icon === 'vegan') return (
    <View className={styles.wrap}>
      <View className={`${styles.leafBody} ${e}`} />
      <View className={`${styles.leafStem} ${e}`} />
      <View className={`${styles.leafVein} ${e}`} />
    </View>
  )

  if (icon === 'allergy') return (
    <View className={styles.wrap}>
      <View className={`${styles.exclamDot} ${e}`} />
      <View className={`${styles.exclamBar} ${e}`} />
    </View>
  )

  if (icon === 'no-drink') return (
    <View className={styles.wrap}>
      <View className={`${styles.glassBody} ${e}`} />
      <View className={`${styles.glassStem} ${e}`} />
      <View className={`${styles.glassBase} ${e}`} />
      <View className={`${styles.glassSlash} ${e}`} />
    </View>
  )

  return null
}

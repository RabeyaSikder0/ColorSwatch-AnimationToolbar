import React, { useCallback, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';


import Icon from 'react-native-vector-icons/MaterialIcons';
import { SFSymbol } from 'react-native-sfsymbols';
import { BUTTONS_LIST } from './buttons';
import { BackButton } from '../components';
import Config from '../Config';
// import * as theme from '../theme';



interface PaletteProp {
  colors: string[],
  index: number;
  activeGesture: SharedValue<number>;
  activeColor: string;
  onColorPress: (color: string) => void;
}

const ITEM_HEIGHT_COLOR = 250;
const ITEM_WIDTH = 60;

const COLOR_PALETTE = [
  ['rgb(195, 107, 88)', 'rgb(216, 160, 164)', 'rgb(209, 178, 195)'],
  ['rgb(202, 106, 123)', 'rgb(224, 156, 192)', 'rgb(212, 171, 215)'],
  ['rgb(187, 122, 248)', 'rgb(212, 172, 250)', 'rgb(216, 191, 251)'],
  ['rgb(118, 134, 247)', 'rgb(157, 183, 259)', 'rgb(168, 198, 250)'],
  ['rgb(103, 130, 169)', 'rgb(182, 208, 237)', 'rgb(195, 218, 246)'],
  ['rgb(0, 0, 0)', 'rgb(64, 68, 88)', 'rgb(122, 128, 159)'],
];


const PaletteItem: React.FC<PaletteProp> = ({
  colors,
  index,
  activeGesture,
  activeColor,
  onColorPress
}) => {
  const viewStyle = useAnimatedStyle(() => {
    const angle = (activeGesture.value / (COLOR_PALETTE.length - 1)) * index;
    return {
      transform: [
        { translateY: 100 },
        { rotate: withSpring(`${angle}deg`, { damping: 100, mass: 0.4 }) },
        { translateY: -100 }
      ]
    }
  }, [activeGesture]);

  const onAnchorPress = useCallback(
    () => (activeGesture.value = activeGesture.value === 0 ? 90 : 0),
    [activeGesture],
  );

  return (
    <Animated.View style={[styles.paletteContainer, styles.paletteSize, viewStyle]}>
      <Pressable
        style={[
          styles.colorItemCommon,
          styles.colorTop,
          { backgroundColor: colors[0] },
        ]}
        onPress={() => onColorPress(colors[0])}
      />
      <Pressable
        style={[
          styles.colorItemCommon,
          styles.colorMiddle,
          { backgroundColor: colors[1] },
        ]}
        onPress={() => onColorPress(colors[1])}
      />
      <Pressable
        style={[styles.colorItemCommon, { backgroundColor: colors[2] }]}
        onPress={() => onColorPress(colors[2])}
      />
      <Pressable style={styles.anchorContainer} onPress={onAnchorPress}>
        <View style={[styles.anchorOuterCircle, { borderColor: activeColor }]}>
          <View
            style={[
              styles.anchorInnerCircle,
              { backgroundColor: activeColor, borderColor: activeColor }
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  )
}


interface ButtonType {
  item: (typeof BUTTONS_LIST)[0];
  index: number;
  activeY: SharedValue<number>;
  offset: SharedValue<number>;
}

const ITEM_HEIGHT = 50 + 16; // 50 = icon height, 16 = top + bottom padding
const TOOLBAR_HEIGHT = ITEM_HEIGHT * 7 + 16; // 50 = button height, 7 = total visible items, 16 = main toolbar's top + bottom padding
const TOTAL_HEIGHT = ITEM_HEIGHT * BUTTONS_LIST.length + 16; // == 1600, BUTTONS_LIST.length === 24, 16 == top + bottom padding
// Max user can scroll (max scroll offset)
// To activate Rubberbanding effect after overscroll on iOS
const endScrollLimit = TOTAL_HEIGHT - TOOLBAR_HEIGHT;

const Button: React.FC<ButtonType> = ({ item, index, activeY, offset }) => {
  const itemEndPos = (index + 1) * ITEM_HEIGHT + 8; // 8 is for top padding here
  const itemStartPos = itemEndPos - ITEM_HEIGHT;

  const isItemActive = useDerivedValue(() => {
    const pressedPoint = activeY.value + offset.value;
    const isValid = pressedPoint >= itemStartPos && pressedPoint < itemEndPos;
    return activeY.value !== 0 && isValid ? true : false;
  }, [activeY]);

  const viewStyle = useAnimatedStyle(() => {
    const scrollValidLimit = offset.value > 0 ? endScrollLimit : 0;

    const isItemOutOfView =
      itemEndPos < offset.value || itemStartPos > offset.value + TOOLBAR_HEIGHT;

    return {
      width: withSpring(isItemActive.value ? 140 : 50, { damping: 15 }),
      // For Scroll Rubberbanding effect
      top:
        offset.value < 0 // Top
          ? (index + 1) * Math.abs(offset.value / 10)
          : offset.value > endScrollLimit // Bottom
            ? -(24 - index + 1) * Math.abs((offset.value - scrollValidLimit) / 10)
            : 0,
      // translate & scaling when icon is (in)active
      transform: [
        {
          translateX: withTiming(isItemActive.value ? 55 : 0, {
            duration: 250,
            easing: Easing.out(Easing.quad),
          }),
        },
        // Item scaling, 1.2 = Active, 0.4 = out of view, 1 = default
        {
          scale: withTiming(
            isItemActive.value ? 1.2 : isItemOutOfView ? 0.4 : 1,
            { duration: 250 },
          ),
        },
      ],
    };
  });

  // Scale down the view that contains the icon,
  // so that container view's scaling when it's active, have no effect on the icon
  const innerViewStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isItemActive.value ? 0.8 : 1, { duration: 250 }) },
      ],
    };
  });

  const titleOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isItemActive.value ? 1 : 0, { duration: 250 }),
    };
  }, [isItemActive]);

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        { backgroundColor: item.color },
        viewStyle,
      ]}
    >
      <Animated.View style={innerViewStyle}>
        {Config.isIos ? (
          <SFSymbol
            name={item.icon}
            weight="semibold"
            scale="large"
            color="white"
            size={20}
            resizeMode="center"
            multicolor={false}
            style={{ padding: 12 }}
          />
        ) : (
          <Icon name={item.icon} color="white" size={24} />
        )}
      </Animated.View>

      <Animated.Text style={[styles.buttonTitle, titleOpacity]}>
        {item.title}
      </Animated.Text>
    </Animated.View>
  );
};

const Toolbar = () => {
  const isDarkMode = useColorScheme() === 'dark';

  // Active press point within TOOLBAR_HEIGHT, 0 when not active.
  const activeY = useSharedValue(0);
  // Contains list scroll offset from top. In (-) when user scroll past the top on iOS (important to activate Rubberbanding effect).
  const scrollOffset = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(_e => {
      activeY.value = _e.y;
    })
    .onUpdate(e => {
      activeY.value = e.y;
    })
    .onEnd(() => {
      activeY.value = 0;
    });

  const scrollHandler = useAnimatedScrollHandler(e => {
    scrollOffset.value = e.contentOffset?.y ?? 0;
  });



  const activeGesture = useSharedValue(0);

  const [activeColor, setActivecolor] = useState('rgb(64, 68, 88)');

  const calculateDegree = useCallback(
    (e: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      'worklet';
      // Get an angle in radians, multiply that by 180 / π to get a value in degree:
      // => "ITEM_HEIGHT - e.y" to take y axis value from bottom (0) to top (ITEM_HEIGHT), as opposed to gesture handler by default returning top (0) to bottom (ITEM_HEIGHT) on the Palette view.
      // => "e.x - ITEM_WIDTH / 2" to consider x's start point from the center of the width.
      let degree =
        Math.atan2(ITEM_HEIGHT_COLOR - e.y, e.x - ITEM_WIDTH / 2) * (180 / Math.PI);
      // This condition is just to have possible 180 degree rotation on both sides while dragging
      degree < -90 && (degree = degree + 360);
      // Subtract from 90 as that is our initial palette's degree position
      return 90 - degree;
    },
    [],
  );

  const dragGestures = Gesture.Pan()
    .onStart(e => {
      activeGesture.value = calculateDegree(e);
    })
    .onUpdate(e => {
      activeGesture.value = calculateDegree(e);
    })
    .onEnd(() => {
      activeGesture.value = activeGesture.value > 90 ? 90 : 0;
    });

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      // backgroundColor={theme.toolbar(isDarkMode).bg}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: activeColor }}
      // style={themeStyles(isDarkMode).container}

      >
        <BackButton />

        <View>
          <View
          // style={[styles.toolbarView, themeStyles(isDarkMode).toolbarView]}
          />
          <GestureDetector gesture={dragGesture}>
            <Animated.FlatList
              style={styles.buttonListView}
              contentContainerStyle={{ padding: 8 }}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              data={BUTTONS_LIST}
              renderItem={({ item, index }) => (
                <Button offset={scrollOffset} {...{ item, activeY, index }} />
              )}
            />
          </GestureDetector>

          <View style={{ flex: 1, marginLeft: 140, position:'relative', justifyContent: 'flex-start' }}>
            <GestureDetector gesture={dragGestures}>
              <View style={styles.paletteSize}>
                {COLOR_PALETTE.map((colors, index) => (
                  <PaletteItem
                    key={index}
                    onColorPress={setActivecolor}
                    {...{ activeColor, colors, index, activeGesture }}
                  />
                ))}
              </View>
            </GestureDetector>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  toolbarView: {
    width: 50 + 16,
    height: TOOLBAR_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 24,
    marginVertical: 40,
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 32,
  },
  buttonListView: {
    position: 'absolute',
    height: TOOLBAR_HEIGHT,
    width: '100%',
    marginHorizontal: 24,
    marginVertical: 40,
    // Note:- This elevation here is just to avoid the scroll not working issue on Android. It won't show unless 'backgroundColor' is added.
    elevation: 32,
  },
  buttonContainer: {
    width: /* icon === 'lasso' ? 'auto' : */ 50,
    height: 50,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: 12,
    marginVertical: 8,
    padding: 13,
    alignItems: 'center',
  },
  buttonTitle: {
    marginLeft: 12,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  paletteSize: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT_COLOR
  },
  paletteContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 20,
  },
  colorItemCommon: {
    flex: 1,
    width: '100%',
    borderRadius: 8
  },
  colorTop: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 4,
  },
  colorMiddle: {
    marginBottom: 4
  },

  anchorContainer: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  anchorOuterCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  anchorInnerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8
  }

});

const themeStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: theme.toolbar(isDarkMode).bg,
    },
    toolbarView: {
      // backgroundColor: theme.toolbar(isDarkMode).bg,
      // shadowColor: theme.toolbar(isDarkMode).shadow,
    },
  });

export default Toolbar;
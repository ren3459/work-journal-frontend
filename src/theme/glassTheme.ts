import { useMemo } from "react";
import { theme } from "antd";
import type { ConfigProviderProps } from "antd";
import { createStyles } from "antd-style";
import clsx from "clsx";

const glassShadow =
  "0 8px 24px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08)";
const glassShadowSecondary =
  "0 6px 18px rgba(0, 0, 0, 0.14), 0 1px 4px rgba(0, 0, 0, 0.08)";
const glassShadowTertiary = "0 2px 8px rgba(0, 0, 0, 0.10)";

const useStyles = createStyles(({ css, cssVar }) => {
  const glassBorderStyles = {
    boxShadow: [
      glassShadowSecondary,
      `inset 0 0 5px 2px rgba(255, 255, 255, 0.3)`,
      `inset 0 5px 2px rgba(255, 255, 255, 0.2)`,
    ].join(","),
  };

  const glassBoxStyles = {
    ...glassBorderStyles,
    background: `color-mix(in srgb, ${cssVar.colorBgContainer} 15%, transparent)`,
    backdropFilter: "blur(12px)",
  };

  return {
    glassBorder: css({
      "&&": glassBorderStyles,
    }),
    glassBox: css({
      "&&": glassBoxStyles,
    }),
    notBackdropFilter: css({
      "&&": {
        backdropFilter: "none",
      },
    }),
    app: css({
      textShadow: "0 1px rgba(0,0,0,0.1)",
    }),
    cardRoot: css({
      "&&": {
        ...glassBoxStyles,
        backgroundColor: `color-mix(in srgb, ${cssVar.colorBgContainer} 40%, transparent)`,
      },
    }),
    modalContainer: css({
      "&&": {
        ...glassBoxStyles,
        backdropFilter: "none",
      },
    }),
    buttonRoot: css({
      "&&": glassBorderStyles,
    }),
    buttonRootDefaultColor: css({
      "&&": {
        background: "transparent",
        color: cssVar.colorText,
      },

      "&&:hover": {
        background: "rgba(255,255,255,0.2)",
        color: `color-mix(in srgb, ${cssVar.colorText} 90%, transparent)`,
      },

      "&&:active": {
        background: "rgba(255,255,255,0.1)",
        color: `color-mix(in srgb, ${cssVar.colorText} 80%, transparent)`,
      },
    }),

    dropdownRoot: css({
      "&&": {
        ...glassBoxStyles,
        borderRadius: cssVar.borderRadiusLG,
      },

      ul: {
        background: "transparent",
      },
    }),
    switchRoot: css({
      "&&": {
        ...glassBorderStyles,
        border: "none",
      },
    }),
    segmentedRoot: css({
      "&&": {
        ...glassBorderStyles,
        background: "transparent",
        backdropFilter: "none",
      },

      "&& .ant-segmented-thumb": {
        ...glassBoxStyles,
      },

      "&& .ant-segmented-item-selected": {
        ...glassBoxStyles,
      },
    }),
    radioButtonRoot: css({
      "&&.ant-radio-button-wrapper": {
        ...glassBorderStyles,
        background: "transparent",
        borderColor: "rgba(255, 255, 255, 0.2)",
        color: cssVar.colorText,

        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.24)",
          color: cssVar.colorText,
        },

        "&.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)":
          {
            ...glassBoxStyles,
            borderColor: "rgba(255, 255, 255, 0.28)",
            color: cssVar.colorText,

            "&::before": {
              backgroundColor: "rgba(255, 255, 255, 0.18)",
            },

            "&:hover": {
              color: cssVar.colorText,
            },
          },
      },
    }),
  };
});

const useGlassTheme = () => {
  const { styles } = useStyles();

  return useMemo<ConfigProviderProps>(
    () => ({
      theme: {
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 12,
          borderRadiusLG: 12,
          borderRadiusSM: 12,
          borderRadiusXS: 12,
          boxShadow: glassShadow,
          boxShadowSecondary: glassShadowSecondary,
          boxShadowTertiary: glassShadowTertiary,
          motionDurationSlow: "0.2s",
          motionDurationMid: "0.1s",
          motionDurationFast: "0.05s",
        },
        components: {
          Layout: {
            headerBg: "#e0ecf1",
            footerBg: "#e0ecf1",
            siderBg: "#e0ecf1",
            bodyBg: "#e0ecf1",
          },
        },
      },
      app: {
        className: styles.app,
      },
      card: {
        classNames: {
          root: styles.cardRoot,
        },
      },
      modal: {
        classNames: {
          container: styles.modalContainer,
        },
      },
      button: {
        classNames: ({ props }) => ({
          root: clsx(
            styles.buttonRoot,
            (props.variant !== "solid" ||
              props.color === "default" ||
              props.type === "default") &&
              styles.buttonRootDefaultColor,
          ),
        }),
      },
      alert: {
        className: clsx(styles.glassBox, styles.notBackdropFilter),
      },
      colorPicker: {
        classNames: {
          root: clsx(styles.glassBox, styles.notBackdropFilter),
        },
        arrow: false,
      },
      dropdown: {
        classNames: {
          root: styles.dropdownRoot,
        },
      },
      select: {
        classNames: {
          root: clsx(styles.glassBox, styles.notBackdropFilter),
          popup: {
            root: styles.glassBox,
          },
        },
      },
      datePicker: {
        classNames: {
          root: clsx(styles.glassBox, styles.notBackdropFilter),
          popup: {
            container: styles.glassBox,
          },
        },
      },
      input: {
        classNames: {
          root: clsx(styles.glassBox, styles.notBackdropFilter),
        },
      },
      inputNumber: {
        classNames: {
          root: clsx(styles.glassBox, styles.notBackdropFilter),
        },
      },
      popover: {
        classNames: {
          container: styles.glassBox,
        },
      },
      switch: {
        classNames: {
          root: styles.switchRoot,
        },
      },
      radio: {
        classNames: {
          root: styles.radioButtonRoot,
        },
      },
      segmented: {
        className: styles.segmentedRoot,
      },
      progress: {
        classNames: {
          track: styles.glassBorder,
        },
        styles: {
          track: {
            height: 12,
          },
          rail: {
            height: 12,
          },
        },
      },
    }),
    [styles],
  );
};
export default useGlassTheme;

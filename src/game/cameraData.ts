import {
  CAMERA_2_FEED_BRIGHTNESS,
  CAMERA_2_FEED_SATURATION,
} from './constants'

export type CameraId = 'cam1' | 'cam2' | 'cam3' | 'cam4' | 'cam5' | 'cam6'

export type AnimatronicId = 'bonnie' | 'chica' | 'freddy'

export type CameraMapButton = {
  defaultSrc: string
  pressedSrc: string
  leftPercent: number
  topPercent: number
  widthPercent: number
}

export type CameraPose = {
  id: string
  imageSrc: string
  label: string
}

export type CameraAnimatronic = {
  id: AnimatronicId
  label: string
  poses: CameraPose[]
  renderOrder: number
}

export type CameraDefinition = {
  animatronics?: CameraAnimatronic[]
  brightness?: number
  hasImage: boolean
  id: CameraId
  imageSrc: string
  label: string
  mapButton: CameraMapButton
  saturation?: number
}

export type CameraPoseSelections = Partial<
  Record<CameraId, Partial<Record<AnimatronicId, string>>>
>

const MAP_BUTTON_WIDTH_PERCENT = 17.2
const WIDE_MAP_BUTTON_WIDTH_PERCENT = 17.8

export const CAMERA_MAP_IMAGE_SRC = '/assets/map/map_clear.png'

export const CAMERA_DEFINITIONS: CameraDefinition[] = [
  {
    id: 'cam1',
    label: 'CAM 01',
    imageSrc: '/assets/cams/cam1/cam1.png',
    hasImage: true,
    mapButton: {
      defaultSrc: '/assets/map/buttons/cam1.png',
      pressedSrc: '/assets/map/buttons/cam1_pressed.png',
      leftPercent: 30.8,
      topPercent: -11.5,
      widthPercent: MAP_BUTTON_WIDTH_PERCENT,
    },
    animatronics: [
      {
        id: 'bonnie',
        label: 'Bonnie',
        renderOrder: 30,
        poses: [
          {
            id: 'bonnie_1',
            label: 'Pose 1',
            imageSrc: '/assets/cams/cam1/bonnie/bonnie_1.png',
          },
          {
            id: 'bonnie_2',
            label: 'Pose 2',
            imageSrc: '/assets/cams/cam1/bonnie/bonnie_2.png',
          },
        ],
      },
      {
        id: 'chica',
        label: 'Chica',
        renderOrder: 10,
        poses: [
          {
            id: 'chica_1',
            label: 'Pose 1',
            imageSrc: '/assets/cams/cam1/chica/chica_1.png',
          },
        ],
      },
      {
        id: 'freddy',
        label: 'Freddy',
        renderOrder: 20,
        poses: [
          {
            id: 'freddy_1',
            label: 'Pose 1',
            imageSrc: '/assets/cams/cam1/freddy/freddy_1.png',
          },
          {
            id: 'freddy_2',
            label: 'Pose 2',
            imageSrc: '/assets/cams/cam1/freddy/freddy_2.png',
          },
          {
            id: 'freddy_3',
            label: 'Pose 3',
            imageSrc: '/assets/cams/cam1/freddy/freddy_3.png',
          },
        ],
      },
    ],
  },
  {
    id: 'cam2',
    label: 'CAM 02',
    imageSrc: '/assets/cams/cam2/cam2.png',
    hasImage: true,
    brightness: CAMERA_2_FEED_BRIGHTNESS,
    saturation: CAMERA_2_FEED_SATURATION,
    mapButton: {
      defaultSrc: '/assets/map/buttons/cam2.png',
      pressedSrc: '/assets/map/buttons/cam2_pressed.png',
      leftPercent: -5.2,
      topPercent: 36.4,
      widthPercent: MAP_BUTTON_WIDTH_PERCENT,
    },
    animatronics: [
      {
        id: 'bonnie',
        label: 'Bonnie',
        renderOrder: 30,
        poses: [
          {
            id: 'bonnie_1',
            label: 'Pose 1',
            imageSrc: '/assets/cams/cam2/bonnie/bonnie_1.png',
          },
        ],
      },
      {
        id: 'chica',
        label: 'Chica',
        renderOrder: 10,
        poses: [
          {
            id: 'chica_1',
            label: 'Pose 1',
            imageSrc: '/assets/cams/cam2/chica/chica_1.png',
          },
          {
            id: 'chica_2',
            label: 'Pose 2',
            imageSrc: '/assets/cams/cam2/chica/chica_2.png',
          },
        ],
      },
      {
        id: 'freddy',
        label: 'Freddy',
        renderOrder: 20,
        poses: [
          {
            id: 'freddy_1',
            label: 'Pose 1',
            imageSrc: '/assets/cams/cam2/freddy/freddy_1.png',
          },
          {
            id: 'freddy_2',
            label: 'Pose 2',
            imageSrc: '/assets/cams/cam2/freddy/freddy_2.png',
          },
        ],
      },
    ],
  },
  {
    id: 'cam3',
    label: 'CAM 03',
    imageSrc: '/assets/cams/cam3/cam3.png',
    hasImage: false,
    mapButton: {
      defaultSrc: '/assets/map/buttons/cam3.png',
      pressedSrc: '/assets/map/buttons/cam3_pressed.png',
      leftPercent: 26.7,
      topPercent: 75.5,
      widthPercent: MAP_BUTTON_WIDTH_PERCENT,
    },
  },
  {
    id: 'cam4',
    label: 'CAM 04',
    imageSrc: '/assets/cams/cam4/cam4.png',
    hasImage: false,
    mapButton: {
      defaultSrc: '/assets/map/buttons/cam4.png',
      pressedSrc: '/assets/map/buttons/cam4_pressed.png',
      leftPercent: 68.8,
      topPercent: 70.6,
      widthPercent: WIDE_MAP_BUTTON_WIDTH_PERCENT,
    },
  },
  {
    id: 'cam5',
    label: 'CAM 05',
    imageSrc: '/assets/cams/cam5/cam5.png',
    hasImage: false,
    mapButton: {
      defaultSrc: '/assets/map/buttons/cam5.png',
      pressedSrc: '/assets/map/buttons/cam5_pressed.png',
      leftPercent: 36.1,
      topPercent: 17.4,
      widthPercent: WIDE_MAP_BUTTON_WIDTH_PERCENT,
    },
  },
  {
    id: 'cam6',
    label: 'CAM 06',
    imageSrc: '/assets/cams/cam6/cam6.png',
    hasImage: false,
    mapButton: {
      defaultSrc: '/assets/map/buttons/cam6.png',
      pressedSrc: '/assets/map/buttons/cam6_pressed.png',
      leftPercent: 96.4,
      topPercent: 43.8,
      widthPercent: WIDE_MAP_BUTTON_WIDTH_PERCENT,
    },
  },
]

export const DEFAULT_CAMERA_ID: CameraId = 'cam1'

export const CAMERA_BY_ID = CAMERA_DEFINITIONS.reduce(
  (cameras, camera) => ({
    ...cameras,
    [camera.id]: camera,
  }),
  {} as Record<CameraId, CameraDefinition>,
)

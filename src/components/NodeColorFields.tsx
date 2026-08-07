import { Group, ColorInput, ColorSwatch, Text } from '@mantine/core'
import { NODE_COLOR_SWATCHES } from '../utils/colorSwatches'

interface ColorFieldsReadViewProps {
  backgroundColor?: string
  borderColor?: string
}

/** Background/border swatch-and-hex read-out, shared by every node inspector's read view. */
export function ColorFieldsReadView({ backgroundColor, borderColor }: ColorFieldsReadViewProps) {
  return (
    <Group grow>
      <div>
        <Text size="xs" c="dimmed">
          Background
        </Text>
        {backgroundColor ? (
          <Group gap={6} mt={2}>
            <ColorSwatch color={backgroundColor} size={16} />
            <Text size="sm">{backgroundColor}</Text>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            Default
          </Text>
        )}
      </div>
      <div>
        <Text size="xs" c="dimmed">
          Border
        </Text>
        {borderColor ? (
          <Group gap={6} mt={2}>
            <ColorSwatch color={borderColor} size={16} />
            <Text size="sm">{borderColor}</Text>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            Default
          </Text>
        )}
      </div>
    </Group>
  )
}

interface ColorFieldsEditFormProps {
  backgroundColor?: string
  borderColor?: string
  onBackgroundChange: (value: string | undefined) => void
  onBorderChange: (value: string | undefined) => void
}

/** Background/border ColorInput pair (with swatches), shared by every node inspector's edit form. */
export function ColorFieldsEditForm({
  backgroundColor,
  borderColor,
  onBackgroundChange,
  onBorderChange,
}: ColorFieldsEditFormProps) {
  return (
    <Group grow>
      <ColorInput
        label="Background"
        placeholder="Default"
        swatches={NODE_COLOR_SWATCHES}
        value={backgroundColor ?? ''}
        onChange={(value) => onBackgroundChange(value || undefined)}
      />
      <ColorInput
        label="Border"
        placeholder="Default"
        swatches={NODE_COLOR_SWATCHES}
        value={borderColor ?? ''}
        onChange={(value) => onBorderChange(value || undefined)}
      />
    </Group>
  )
}

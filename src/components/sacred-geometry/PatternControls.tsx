import React from 'react';
import {
  Box,
  Slider,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  SelectChangeEvent
} from '@mui/material';
import { PatternType } from '../../types/sacred-geometry';

interface PatternControlsProps {
  patternType: PatternType;
  scale: number;
  rotation: number;
  animate: boolean;
  onPatternTypeChange: (type: PatternType) => void;
  onScaleChange: (scale: number) => void;
  onRotationChange: (rotation: number) => void;
  onAnimateChange: (animate: boolean) => void;
}

export const PatternControls: React.FC<PatternControlsProps> = ({
  patternType,
  scale,
  rotation,
  animate,
  onPatternTypeChange,
  onScaleChange,
  onRotationChange,
  onAnimateChange
}) => {
  const handlePatternTypeChange = (event: SelectChangeEvent<PatternType>) => {
    onPatternTypeChange(event.target.value as PatternType);
  };

  return (
    <Box sx={{ p: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="pattern-type-label">Pattern Type</InputLabel>
        <Select<PatternType>
          labelId="pattern-type-label"
          value={patternType}
          label="Pattern Type"
          onChange={handlePatternTypeChange}
        >
          <MenuItem value="flowerOfLife">Flower of Life</MenuItem>
          <MenuItem value="metatronsCube">Metatron's Cube</MenuItem>
          <MenuItem value="vesicaPiscis">Vesica Piscis</MenuItem>
          <MenuItem value="sriYantra">Sri Yantra</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Scale</Typography>
        <Slider
          value={scale}
          min={0.5}
          max={2}
          step={0.1}
          onChange={(_, value) => onScaleChange(value as number)}
          valueLabelDisplay="auto"
          aria-label="Pattern scale"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Rotation</Typography>
        <Slider
          value={rotation}
          min={0}
          max={360}
          onChange={(_, value) => onRotationChange((value as number) * Math.PI / 180)}
          valueLabelDisplay="auto"
          aria-label="Pattern rotation"
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={animate}
            onChange={(event) => onAnimateChange(event.target.checked)}
            name="animate"
          />
        }
        label="Animate Pattern"
      />
    </Box>
  );
};
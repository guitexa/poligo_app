import React from 'react';
import { Theme, makeStyles } from '@material-ui/core/styles';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';

const MaterialTooltip: React.FC<TooltipProps> = ({ children, ...rest }) => {
  const useStylesBootstrap = makeStyles((theme: Theme) => ({
    arrow: {
      color: theme.palette.common.black,
    },
    tooltip: {
      backgroundColor: theme.palette.common.black,
      fontSize: 12,
      fontWeight: 'lighter',
    },
  }));

  const classes = useStylesBootstrap();

  return (
    <Tooltip arrow classes={classes} {...rest} enterDelay={0} leaveDelay={100}>
      <div style={{ display: 'flex' }}>{children}</div>
    </Tooltip>
  );
};

export default MaterialTooltip;

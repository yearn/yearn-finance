import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const LinearProgressBar = withStyles(() => ({
  root: {
    height: 5,
  },
  colorPrimary: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  bar: {
    borderRadius: 5,
    backgroundColor: ({ value }) =>
      // eslint-disable-next-line no-nested-ternary
      value < 75 ? '#23d198' : value <= 100 ? '#FABF06' : '#EF1E02',
  },
}))(LinearProgress);

const useStyles = makeStyles({
  root: {
    width: '100%',
    flexGrow: 1,
  },
});

export default function CreamProgressBars({ value }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <LinearProgressBar
        variant="determinate"
        value={value > 100 ? 101 : value}
      />
    </div>
  );
}

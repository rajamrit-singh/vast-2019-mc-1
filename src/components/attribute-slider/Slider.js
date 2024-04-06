import { useDispatch } from 'react-redux';
import {setHeatmapDuration} from '../../store/actionCreators';

export const Slider = () => {
  const dispatch = useDispatch();

  function onSelected(d) {
    dispatch(setHeatmapDuration(d))
  }

  return (
    <div>
       <span className="leftlabel">15 Minutes </span>
      <input
        type="range"
        min={15}
        max={60}
        step={15}
        defaultValue={15}
        onChange={(d) => onSelected(d.target.value)}
      />
      <span className="rightlabel"> 1 Hour</span>
    </div>
  );
};
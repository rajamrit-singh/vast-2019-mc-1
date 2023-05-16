import { Dropdown, DropdownButton } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ATTRIBUTE_LIST } from '../../constants.js';
import { setCurrentChoroplethAttribute, setEndDate, setStartDate } from '../../store/actionCreators';

export const AttributeDropdown = () => {
    const dispatch = useDispatch();
    const selectedAttribute = useSelector(state => state.entities.current_choropleth_attribute);
    const handleSelect = (eventKey) => {
        dispatch(setCurrentChoroplethAttribute(eventKey))
        dispatch(setStartDate("4/5/2020  1:40:00 PM"))
        dispatch(setEndDate("4/13/2020  3:15:00 PM"))
    };
    return (
        <DropdownButton
            variant="primary"
            title={selectedAttribute ? ATTRIBUTE_LIST[selectedAttribute] : "Select an attribute"}
            value={selectedAttribute}
            onSelect={handleSelect}
    >{Object.keys(ATTRIBUTE_LIST).map((att, index) => (<Dropdown.Item eventKey={att} key={att+index}>{ATTRIBUTE_LIST[att]}</Dropdown.Item>))}</DropdownButton>
    )
}

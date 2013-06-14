/**
 * Created with IntelliJ IDEA.
 *
 */
/**
 * 获取元素位置
 * @param e  dom
 * @returns {{left: number, top: number}}
 */
function getElementPosition(e){
    var x= 0, y=0;
    while(e!=null){
        x += e.offsetLeft;
        y += e.offsetTop;
        e = e.offsetParent;
    }
    return {left: x, top: y};
}

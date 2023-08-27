//서버가 아닌 클라이언트 측(브라우저)에서 실행되는 코드
const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement = btn.closest('article');

    //http요청을 보낼 때, 브라우저에서 제공하는 메소드
    //단순히 데이터를 가지고오는 것뿐만 아니라, 데이터를 보내는데도 사용됨 
    //fetch('경로', '요청을 구성할 객체') : 경로는 root값(http://localhost:3001)을 생략하면 현재 호스트로 보냄
    fetch('/admin/product/' + prodId, {
        //post사용 시, req.body의 객체도 사용할 수 있음
        //post본문이 없는 삭체요청이기때문에 JSON객체를 보내고있지 않지만, 백엔드에서 JSON객체를 parsing함
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
    .then(result => {
        return result.json();
    })
    .then(data => { //data를 통해 응답 본문을 첨부 (DOM요소 삭제를 위함)
        console.log(data);
        productElement.parentNode.removeChild(productElement); /********부모를 타고 다시 본인으로 돌아와 삭제요소 삭제*/
    })
    .catch(err => {
        console.log(err);
    })
};
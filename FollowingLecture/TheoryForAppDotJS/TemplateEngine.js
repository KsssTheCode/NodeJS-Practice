/*

* Template Engine
  - HTML과 유사한 템플릿을 스캔한 뒤 사용하고 있는 엔진 종류에 따라 플레이스홀더나 특정 스니펫을 실제 HTML구문으로 교체함

* Template Engine의 종류 (무료)
   - 다양한 구문, 특징, 원리를 사용하여 템플릿을 생성하므로 선택해서 사용가능함

   - EJS : 일반 HTML과 순수 javascript를 사용하여 for문이나 if문에서도 작성 가능
     ex) <p> <%= name %> </p>
   - Pug(jade) : 최소한의 HTML과 맞춤형 템플릿 언어를 사용하여 list, for문, if문 사용가능
     ex) p #{name}
   - Handlebars : HTML과 제한된 기능의 맞춤형 템플릿 언어를 사용하여 if문, list등의 공통요소를 포함하고 있음
                : 다른 엔진에 비해 기느의 수가 더 적고, 다른 원리를 따름
                : express.js 내부에 통합되어있음 (install시 express-handlebars)
     ex) <p> {{ name }} </p>

   - 템플릿 엔진은 완성된 템플릿의 캐시를 저장하는데, 모든 요청에 따라 템플릿을 다시 구축하지않아 좀 더 빨리 변환할 수 있음
*/
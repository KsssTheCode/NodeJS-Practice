/* Association 

*/

//new Sequelize('DB명', 'username', 'password', {options: ~~});
//커넥션 풀은 자동으로 생성됨

/* Suquelize 패키지 (Object-Relational Mapping Libarary) **********************************
   - 백그라운드에서 JavaScript객체로 맵핑하여 실제 SQL코드를 처리하는 패키지로 SQL문을 직접 작성할 필요가 없음
   - 객체가 Sequelize에 의해 DB에 맵핑되면 테이블, 관계 등을 자동으로 생성되는 형식
   - 외부패키지로 기본적으로 mysql2패키지가 install되어 있어야함
******************************************************************************************/

/* create() **********************************
    - 모델에 기반한 새 요소를 생성한 후, 즉시 DB에 저장
*********************************************/
/* build() *****************************************
    - 모델에 기반한 새 JS객체를 생성만 해줌 (수동으로 저장해야함)
***************************************************/
/* findAll() *********************************************************************
    - 기존의 fetchAll()메소드와 동일한 역할
    - 모델의 모든 기록을 불러옴
   * where조건 부여하기 (추가적인 조건에 관해서는 공식문서 참조 => Sequelize홈페이지 Querying메뉴
      findAll({where: { 속성 : 조건 }})
*********************************************************************************/
/* findByPk() ******************************
    - PrimaryKey단위(주로 SEQ_NO)로 DB에서 검색
    - 하나의 객체로 return
    - Sequelize 5.0이하에서는 findById()
********************************************/
/* save() *********************
    - 데이터를 DB에 저장해주는 메소드
*******************************/
/* destroy() *********************
    - 데이터를 DB에서 삭제해주는 메소드
**********************************/

/* 기준객체.belongsTo(연결객체, {속성:속성값}) *********************************************
    - 연결객체가 기준객체에 속해있다는 뜻(ex: 사용자가 제품을 생성하므로 사용자 > 제품)
    - 두 객체에 Association부여하는 메소드

    - 속성에는 constrains, onDelete등이 있음
      (constraints는 항상 true로 해야 제약이 걸림(FK),
       onDelete : 'CASCADE'는 객체가 삭제되거나 수정될 때, 연결객체도 모두 삭제된다는 의미)
******************************************************************************/
/* 기준객체.hasMany(연결객체) **********
    - 기준객체가 다수의 연결객체를 포함 (x:다)
************************************/
/* 기준객체.hasOne(연결객체) **********
    - 기준객체가 하나의 연결객체만 포함 (x:1)
***********************************/
/* 기준객체.belongsToMany(연결객체) **********
    - 다수의 연결객체가 기준객체를 포함 (다:x)
******************************************/

/* 기준객체.create연결객체명({속성:속성값}) *************************
    - belongsTo와 hasMany메소드가 실행된 시점이라면,
      sequelize에서 객체를 생성할 수 있도록 제공해주는 메소드
***************************************************/
/* 기준객체.add연결객체명({속성:속성값}) ********************** 
    - 다대다의 관계로 생성된 시점이라면,
      sequelize에서 객체를 생성할 수 있도록 제공해주는 메소드
*******************************************************/


/* sync({속성:속성값}) *********************************************
    - 버퍼내용을 동기화해주는 메소드(데이터 + 메타데이터)
    - 항상 성공하므로 반환값이 없음
    - 속성에 force:true가 들어가게 되면 개발 중 새로운 변경들을 반영할 수 있음
      (다만, 모두 지우고 새로 생성하는 방식이라 기존 데이터들이 모두 삭제됨)

    - 이 외에도 fsync(), fdatasync()가 있음 (성공시 :0, 오류시: -1)
******************************************************************/
// 11-03 주소에서 /classic을 뺐다. 페이지는 app/(classic) 아래에 있고, 옛 /classic 주소는 app/classic/[[...path]] 가 새 주소로 넘긴다.
// 웹툰 보기는 11-03 내렸다. 예전에 웹툰을 고른 브라우저 기억만 지운다.

// 11-01 내린 페이지(공지, 가이드, 가격. 자료실 /tools 는 11-04 되살림). 파일이 없어 404로 응답하고, 사람은 첫 화면으로 옮긴다
export const removedPaths = ["/notice/design-3", "/classic/notice/design-3", "/guide", "/pricing"];

/** 루트 레이아웃 head 스크립트. 예전 웹툰 기억을 지우고, 내린 페이지 주소면 첫 화면으로 옮긴다. 11-03 옛 /3d/ 주소(404)는 /3d 로 옮긴다. */
export const lookRedirectScript = `try{if(/^\\/3d\\/(index\\.html)?$/.test(location.pathname)){location.replace("/3d"+location.hash)}else{var p=location.pathname.replace(/\\/$/,"")||"/";try{localStorage.removeItem("look")}catch(e){}if(${JSON.stringify(removedPaths)}.some(function(x){return p===x||p.indexOf(x+"/")===0}))location.replace("/")}}catch(e){}`;

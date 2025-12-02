<template>
    <div>
        <header class="appbar">
            <h1 class ="title"> Salas PACE UCN</h1>
            <div class="logos">
                <img src="@/assets/pace.png" class="logo">
                <img src="@/assets/LogoUCN_acentuado.png" class="logo">
            </div>
        </header>        
    </div>
   
</template>
<style>
.appbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 100%;

}
.logos {
    display: flex;
    align-items: center;
    margin-right: 5%;
    gap: 15px;
}
.logo{
    width: 75px;
    height: 75px;
    object-fit: contain;
}
.title{
    font-family: "Cal Sans", sans-serif;
    font-weight: bolder;
    font-size: 2.5rem;
    margin-left: 2%;
    margin-top: 0;
    margin-bottom: 0;
    line-height: 1;
    align-self: center;
}
</style>

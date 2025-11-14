<template>
    <div>
        <header class="appbar">
            <h1 class ="title"> Salas PACE UCN</h1>
            <img src="@/assets/LogoUCN_acentuado.png" class="logo"></img>
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
.logo{
    width: 75px;
    height: 75px;
    margin-right: 5%;
    margin-top: 1%;
    margin-bottom: 1%;
    object-fit: cover;
}
.title{
    font-family: "Cal Sans", sans-serif;
    font-weight: 500;
}
</style>

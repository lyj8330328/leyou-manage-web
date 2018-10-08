<template>
  <v-card>
    <v-card-title>
      <v-btn fab dark color="indigo" @click="addBrand">
        <v-icon class="pt-3" dark>add</v-icon>
      </v-btn>
      <v-btn fab dark color="error" @click="deleteAllBrand">
        <v-icon class="pt-3" dark>delete</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-text-field label="搜索" class="flex sm3"  append-icon="search" v-model="search"></v-text-field>
    </v-card-title>
    <v-divider></v-divider>
    <v-data-table
      :headers="headers"
      :items="brands"
      :pagination.sync="pagination"
      :total-items="totalBrands"
      :loading="loading"
      class="elevation-10"
      select-all
      v-model="selected"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">
          <v-checkbox v-model="props.selected" primary hide-details>

          </v-checkbox>
        </td>
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.name }}</td>
        <td class="text-xs-center"><img :src="props.item.image"/></td>
        <td class="text-xs-center">{{ props.item.letter }}</td>
        <td class="text-xs-center">
            <div class="text-xs-center">
              <v-btn flat icon color="indigo" @click="editBrand(props.item)">
                <v-icon>edit</v-icon>
              </v-btn>

              <v-btn flat icon color="error" @click="deleteBrand(props.item)">
                <v-icon>delete</v-icon>
              </v-btn>
            </div>
        </td>
      </template>
    </v-data-table>
    <v-dialog v-model="show" scrollable persistent max-width="500px">
      <v-card color="blue lighten-4" class="white--text">
        <v-card-title>
          <span class="headline">{{isEdit?'修改':'新增'}}品牌</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="show = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-5">
          <my-brand-form @reload="reload" v-bind:isEdit="isEdit" v-bind:oldBrand="oldBrand"></my-brand-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  import MyBrandForm from './MyBrandForm'
    export default {
      name: "MyBrand",
      data() {
        return {
          headers: [
            {text: "id", value: "id", align: 'center', sortable: true},
            {text: "名称", value: "name", align: 'center', sortable: false},
            {text: "LOGO", value: "image", align: 'center', sortable: false},
            {text: "首字母", value: "letter", align: 'center', sortable: true},
            {text: "操作", align: 'center', sortable: false},
          ],
          brands:[

          ],
          pagination:{},
          totalBrands:0,
          loading:false,
          search:'',
          show:false,  //控制对话框的显示
          oldBrand:{}, //回显要修改的数据
          isEdit:false, //是否编辑
          selected:[] //选择的条目
        }
      },
      watch:{
        pagination:{
          deep:true,
          handler(){
            this.getDataFromServer();
          }
        },
        search:{
          deep:true,
          handler() {
            //console.log(this.search)
            this.getDataFromServer();
          }
        }
      },
      created(){
        this.getDataFromServer();
      },
      methods:{
        getDataFromServer(){

          // 开启进度条
          this.loading = true;

          //发起ajax请求
          // 分页查询page,rows,key,sortBy,desc

          this.$http.get("/item/brand/page",{
            params:{
              page:this.pagination.page,
              rows:this.pagination.rowsPerPage,
              sortBy:this.pagination.sortBy,
              desc:this.pagination.descending,
              key:this.search,
            }
          }).then(resp =>{
            //console.log(resp)
            this.brands=resp.data.items;
            this.totalBrands = resp.data.total;
            //关闭进度条
            this.loading = false;
          })

        },
        reload(){
          //关闭对话框
          this.show=false;
          //刷新页面
          this.getDataFromServer();
        },
        addBrand(){
          this.isEdit=false;
          this.show=true;
          this.oldBrand = null;
        },
        editBrand(oldBrand){
          //根据品牌信息查询商品分类
          this.$http.get("/item/category/bid/"+oldBrand.id).then(
            ({data}) => {
              this.isEdit=true;
              //显示弹窗
              this.show=true;
              //获取要编辑的brand
              this.oldBrand=oldBrand;
              this.oldBrand.categories = data;
            }
          ).catch();

        },
        deleteBrand(oldBrand){
          if (this.selected.length === 1 && this.selected[0].id === oldBrand.id) {
            this.$message.confirm('此操作将永久删除该品牌, 是否继续?').then(
              () => {
                //发起删除请求，删除单条数据
                  this.$http.delete("/item/brand/bid/" + oldBrand.id).then(() => {
                    this.getDataFromServer();
                  }).catch()
              }
            ).catch(() => {
              this.$message.info("删除已取消！");
            });
          }
        },
        deleteAllBrand(){
          //拼接id数组
          /**
           * 加了{}就必须有return
           * @type {any[]}
           */
          const ids = this.selected.map( s => s.id);
          //console.log(ids.length);
          if (ids.length>0) {
            this.$message.confirm('此操作将永久删除所选品牌，是否继续?').then(
              () => {
                this.$http.delete("/item/brand/bid/" + ids.join("-")).then(() => {
                  this.getDataFromServer();
                }).catch();
              }
            ).catch(() => {
              this.$message.info("删除已取消！");
            });
          }
        }
      },
      components:{
        MyBrandForm
      }
    }
</script>

<style scoped>

</style>

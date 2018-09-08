<template>
      <v-form v-model="valid" ref="BrandForm">
        <v-text-field v-model="brand.name" label="品牌名称" required :rules="[v => !!v || '品牌名称不能为空']">
        </v-text-field>
        <v-text-field v-model="brand.letter" label="品牌首字母" required mask="A" :rules="[v => !!v || '品牌名称不能为空']"></v-text-field>
        <v-cascader
          url="/item/category/list"
          multiple
          required
          v-model="brand.categories"
          label="请选择商品分类"/>
        <v-layout row>
          <v-flex xs4>
            <span style="font-size: 20px; color: #444">LOGO</span>
          </v-flex>
          <v-flex>
            <v-upload ref="image_url"
              v-model="brand.image"
              url="/upload/image"
              :multiple="false"
              :pic-width="250"
              :pic-height="90"
            />
          </v-flex>
        </v-layout>
        <v-layout class="pt-3" >
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="clear">清空</v-btn>
          <v-btn color="blue darken-1" flat @click="submit">保存</v-btn>
        </v-layout>
      </v-form>
</template>

<script>
    export default {
        name: "MyBrandForm",
        data(){
          return {
            valid:false,
            brand:{
              name:'',
              letter:'',
              image:'',
              categories:[]
            }
          }
        },
      props:{
          oldBrand:{type:Object},
          isEdit:{type: Boolean,default:false}
      },
      watch:{
        oldBrand:{
          deep:true,
          handler(val){
            if(val){
              this.brand=Object.deepCopy(val);
            }else{
              this.clear();
            }
          }
        }
      },
      methods:{
          submit(){
            //提交表单
              if(this.$refs.BrandForm.validate()){
                /**
                 * 使用解构表达式获取数据，除categories以外的数据都放入rest中，然后对categories使用map进行处理，得到id后重新赋值给
                 * rest里面的categories数组
                 */
                const {categories, ... rest}=this.brand;
                rest.categories=categories.map(c => c.id).join(",");
                console.log(rest)
                if(this.isEdit) {
                  this.$http.delete("/item/brand/cid_bid/" + this.oldBrand.id).then().catch();
                }
                this.$http({
                  method:this.isEdit ? 'put' :'post',
                  url:"/item/brand",
                  data:this.$qs.stringify(rest),
                }).then(
                  () =>{
                    //关闭对话框
                    this.$emit('reload');
                    this.$message.success("保存成功！");
                    this.clear();
                  }
                ).catch(
                  ()=>{
                    this.$message.success("保存失败！");
                  }
                );
              }
          },
        clear(){
            //重置表单
          this.brand.name='';
          this.brand.letter='';
          this.brand.image='';
          this.brand.categories=[];
          this.$refs.image_url._data.dialogImageUrl='';
        }
      }
    }
</script>

<style scoped>

</style>

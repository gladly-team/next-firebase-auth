import t1 from 'codemod/rename-authuser-withauthusertokenssr'
import t2 from 'codemod/rename-authuser-withauthuserssr'
import t3 from 'codemod/withauthuser-to-withuser'
import t4 from 'codemod/withauthusertokenssr-to-withusertokenssr'
import t5 from 'codemod/withauthuserssr-to-withuserssr'
import t6 from 'codemod/useauthuser-to-useuser'
import t7 from 'codemod/rename-authuser-setauthcookies'

// Run all codemods to migrate to v1
export default function transformer(...args) {
  t1(...args)
  t2(...args)
  t3(...args)
  t4(...args)
  t5(...args)
  t6(...args)
  t7(...args)
}
